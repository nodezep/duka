import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, LogIn, LogOut, Clock } from "lucide-react";
import { toast } from "sonner";

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

type ShiftTab = "week" | "list" | "attendance";

export default function Shifts() {
  const { tenantId, branchId, branches } = useTenantContext();
  const { user } = useAuth();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ShiftTab>("week");
  const [scopeBranch, setScopeBranch] = useState<string>("__all__");
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek());

  const STATUS_MAP: Record<string, { label: string; pill: string }> = {
    scheduled:   { label: t("shifts.status.scheduled"), pill: "g-pill g-pill-ghost" },
    in_progress: { label: t("shifts.status.in_progress"), pill: "g-pill g-pill-brand" },
    completed:   { label: t("shifts.status.completed"), pill: "g-pill g-pill-ok" },
    missed:      { label: t("shifts.status.missed"), pill: "g-pill g-pill-bad" },
  };

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekStart]);

  const branchFilter = scopeBranch === "__all__" ? null : scopeBranch;

  const { data: employees } = useQuery({
    queryKey: ["staff-employees", tenantId],
    enabled: !!tenantId,
    queryFn: async () =>
      (await supabase.from("employees").select("id, full_name, role, status, branch_id")
        .eq("tenant_id", tenantId!).eq("status", "active").order("full_name")).data ?? [],
  });

  const { data: shifts } = useQuery({
    queryKey: ["shifts", tenantId, branchFilter, weekStart.toISOString()],
    enabled: !!tenantId,
    queryFn: async () => {
      let q = supabase.from("employee_shifts")
        .select("*, employees(full_name, role)")
        .eq("tenant_id", tenantId!)
        .gte("scheduled_start", weekStart.toISOString())
        .lt("scheduled_start", weekEnd.toISOString())
        .order("scheduled_start");
      if (branchFilter) q = q.eq("branch_id", branchFilter);
      return (await q).data ?? [];
    },
  });

  const { data: attendance } = useQuery({
    queryKey: ["attendance", tenantId, branchFilter],
    enabled: !!tenantId,
    queryFn: async () => {
      let q = supabase.from("attendance_logs")
        .select("*, employees(full_name)")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (branchFilter) q = q.eq("branch_id", branchFilter);
      return (await q).data ?? [];
    },
  });

  if (!tenantId || !user) {
    return <div className="h-meta py-16 text-center">{t("shifts.loading")}</div>;
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const shiftsByDay = (date: Date) =>
    (shifts ?? []).filter((s: any) => {
      const sd = new Date(s.scheduled_start);
      return sd.toDateString() === date.toDateString();
    });

  const checkIn = async (shift: any) => {
    const { error: e1 } = await supabase.from("attendance_logs").insert({
      tenant_id: tenantId, branch_id: shift.branch_id, employee_id: shift.employee_id, type: "check_in",
    });
    if (e1) return toast.error(e1.message);
    const { error: e2 } = await supabase.from("employee_shifts")
      .update({ check_in: new Date().toISOString(), status: "in_progress" }).eq("id", shift.id);
    if (e2) return toast.error(e2.message);
    toast.success(t("shifts.msg.checkin"));
    qc.invalidateQueries({ queryKey: ["shifts"] });
    qc.invalidateQueries({ queryKey: ["attendance"] });
  };

  const checkOut = async (shift: any) => {
    const { error: e1 } = await supabase.from("attendance_logs").insert({
      tenant_id: tenantId, branch_id: shift.branch_id, employee_id: shift.employee_id, type: "check_out",
    });
    if (e1) return toast.error(e1.message);
    const { error: e2 } = await supabase.from("employee_shifts")
      .update({ check_out: new Date().toISOString(), status: "completed" }).eq("id", shift.id);
    if (e2) return toast.error(e2.message);
    toast.success(t("shifts.msg.checkout"));
    qc.invalidateQueries({ queryKey: ["shifts"] });
    qc.invalidateQueries({ queryKey: ["attendance"] });
  };

  const fmtRange = (start: string, end: string) => {
    const s = new Date(start), e = new Date(end);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`;
  };

  const navWeek = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  };

  const shiftList = shifts ?? [];
  const attendanceList = attendance ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="orb"><Calendar className="h-5 w-5" /></div>
          <div>
            <div className="h-meta g-page-subtitle text-ink-400">{t("shifts.meta")}</div>
            <h1 className="h-display g-page-title">{t("shifts.title")}</h1>
            <div className="h-meta g-page-subtitle text-ink-500">
              {shiftList.length} {shiftList.length !== 1 ? t("shifts.subtitle.plural") : t("shifts.subtitle.single")}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={scopeBranch} onValueChange={setScopeBranch}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("shifts.branch.all")}</SelectItem>
              {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button type="button" className="g-btn g-btn-primary">
                <Plus className="h-4 w-4" /> {t("shifts.new")}
              </button>
            </DialogTrigger>
            <ShiftForm
              tenantId={tenantId}
              defaultBranchId={branchFilter ?? branchId ?? branches[0]?.id ?? ""}
              branches={branches}
              employees={employees ?? []}
              onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["shifts"] }); }}
            />
          </Dialog>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 glass-thin rounded-xl w-fit">
        {(["week", "list", "attendance"] as ShiftTab[]).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            className={`g-btn ${tab === tabKey ? "g-btn-primary" : "g-btn-ghost"} g-btn-sm`}
            onClick={() => setTab(tabKey)}
          >
            {tabKey === "week" ? t("shifts.tab.week") : tabKey === "list" ? t("shifts.tab.list") : t("shifts.tab.attendance")}
          </button>
        ))}
      </div>

      {/* Week view */}
      {tab === "week" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button type="button" className="g-btn g-btn-ghost g-btn-sm" onClick={() => navWeek(-1)}>{t("shifts.nav.prev")}</button>
              <button type="button" className="g-btn g-btn-ghost g-btn-sm" onClick={() => setWeekStart(startOfWeek())}>{t("shifts.nav.today")}</button>
              <button type="button" className="g-btn g-btn-ghost g-btn-sm" onClick={() => navWeek(1)}>{t("shifts.nav.next")}</button>
            </div>
            <div className="h-meta text-sm text-ink-500">
              {weekStart.toLocaleDateString([], { day: "numeric", month: "short" })} —{" "}
              {new Date(weekEnd.getTime() - 1).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const list = shiftsByDay(d);
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div
                  key={d.toISOString()}
                  className={`glass${isToday ? "-strong" : ""} rounded-xl p-2 min-h-[180px]`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                    {d.toLocaleDateString([], { weekday: "short" })}
                    <span className={`ml-1 ${isToday ? "text-brand-600" : "text-ink-900"}`}>{d.getDate()}</span>
                  </div>
                  <div className="space-y-1.5">
                    {list.length === 0 && <div className="text-xs text-ink-400 italic">—</div>}
                    {list.map((s: any) => {
                      const st = STATUS_MAP[s.status] ?? STATUS_MAP.scheduled;
                      return (
                        <div key={s.id} className="glass-thin rounded-lg p-2 text-xs space-y-1">
                          <div className="font-medium truncate text-ink-900">{s.employees?.full_name ?? "—"}</div>
                          <div className="text-ink-500 tabular-nums">{fmtRange(s.scheduled_start, s.scheduled_end)}</div>
                          <span className={`${st.pill} g-pill-h20`}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {tab === "list" && (
        shiftList.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="orb mx-auto mb-4"><Calendar className="h-7 w-7" /></div>
            <h2 className="h-display font-semibold text-lg">{t("shifts.empty.title")}</h2>
            <p className="h-meta g-page-subtitle text-ink-500 mt-1">{t("shifts.empty.desc")}</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_100px_120px] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400 border-b border-white/10">
              <span>{t("shifts.col.employee")}</span>
              <span>{t("shifts.col.start")}</span>
              <span>{t("shifts.col.end")}</span>
              <span>{t("shifts.col.checkin")}</span>
              <span>{t("shifts.col.checkout")}</span>
              <span>{t("common.status")}</span>
              <span className="text-right">{t("common.action")}</span>
            </div>
            {shiftList.map((s: any, idx: number) => {
              const st = STATUS_MAP[s.status] ?? STATUS_MAP.scheduled;
              return (
                <div
                  key={s.id}
                  className={`grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_100px_120px] gap-3 px-4 py-3 items-center hover:bg-white/5 transition-colors${idx < shiftList.length - 1 ? " border-b border-white/10" : ""}`}
                >
                  <span className="font-medium text-sm text-ink-900">{s.employees?.full_name ?? "—"}</span>
                  <span className="text-sm tabular-nums text-ink-700">{new Date(s.scheduled_start).toLocaleString()}</span>
                  <span className="text-sm tabular-nums text-ink-700">{new Date(s.scheduled_end).toLocaleString()}</span>
                  <span className="text-sm tabular-nums text-ink-500">{s.check_in ? new Date(s.check_in).toLocaleTimeString() : "—"}</span>
                  <span className="text-sm tabular-nums text-ink-500">{s.check_out ? new Date(s.check_out).toLocaleTimeString() : "—"}</span>
                  <span className={st.pill}>{st.label}</span>
                  <div className="flex gap-1 justify-end">
                    {!s.check_in && (
                      <button type="button" className="g-btn g-btn-ghost g-btn-sm flex items-center gap-1" onClick={() => checkIn(s)}>
                        <LogIn className="h-3 w-3" /> {t("shifts.btn.checkin")}
                      </button>
                    )}
                    {s.check_in && !s.check_out && (
                      <button type="button" className="g-btn g-btn-ghost g-btn-sm flex items-center gap-1" onClick={() => checkOut(s)}>
                        <LogOut className="h-3 w-3" /> {t("shifts.btn.checkout")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Attendance view */}
      {tab === "attendance" && (
        attendanceList.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="orb mx-auto mb-4"><Clock className="h-7 w-7" /></div>
            <h2 className="h-display font-semibold text-lg">{t("shifts.att.empty.title")}</h2>
            <p className="h-meta g-page-subtitle text-ink-500 mt-1">{t("shifts.att.empty.desc")}</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2fr_2fr_120px] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400 border-b border-white/10">
              <span>{t("common.date")}</span>
              <span>{t("shifts.col.employee")}</span>
              <span>{t("shifts.col.type")}</span>
            </div>
            {attendanceList.map((a: any, idx: number) => (
              <div
                key={a.id}
                className={`grid grid-cols-[2fr_2fr_120px] gap-3 px-4 py-3 items-center hover:bg-white/5 transition-colors${idx < attendanceList.length - 1 ? " border-b border-white/10" : ""}`}
              >
                <span className="text-sm tabular-nums text-ink-500">{new Date(a.created_at).toLocaleString()}</span>
                <span className="font-medium text-sm text-ink-900">{a.employees?.full_name ?? "—"}</span>
                <span>
                  {a.type === "check_in"
                    ? <span className="g-pill g-pill-ok flex items-center gap-1 w-fit"><Clock className="h-3 w-3" />{t("shifts.btn.checkin")}</span>
                    : <span className="g-pill g-pill-ghost flex items-center gap-1 w-fit"><Clock className="h-3 w-3" />{t("shifts.btn.checkout")}</span>
                  }
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function ShiftForm({
  tenantId, defaultBranchId, branches, employees, onClose,
}: {
  tenantId: string;
  defaultBranchId: string;
  branches: any[];
  employees: any[];
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const now = new Date();
  const later = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const [form, setForm] = useState({
    employee_id: "",
    branch_id: defaultBranchId,
    scheduled_start: toLocalInput(now),
    scheduled_end: toLocalInput(later),
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id || !form.branch_id) return toast.error(t("shifts.err.req"));
    if (new Date(form.scheduled_end) <= new Date(form.scheduled_start)) {
      return toast.error(t("shifts.err.dates"));
    }
    setSaving(true);
    const { error } = await supabase.from("employee_shifts").insert({
      tenant_id: tenantId,
      employee_id: form.employee_id,
      branch_id: form.branch_id,
      scheduled_start: new Date(form.scheduled_start).toISOString(),
      scheduled_end: new Date(form.scheduled_end).toISOString(),
      status: "scheduled",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(t("shifts.msg.created"));
    onClose();
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>{t("shifts.new")}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label>{t("shifts.form.employee")}</Label>
          <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
            <SelectTrigger><SelectValue placeholder={t("shifts.form.select")} /></SelectTrigger>
            <SelectContent>
              {employees.length === 0 && <div className="p-2 text-xs text-ink-500">{t("shifts.form.no_emp")}</div>}
              {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t("shifts.form.branch")}</Label>
          <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
            <SelectTrigger><SelectValue placeholder={t("shifts.form.select")} /></SelectTrigger>
            <SelectContent>
              {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("shifts.form.start")}</Label>
            <Input type="datetime-local" required value={form.scheduled_start}
              onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("shifts.form.end")}</Label>
            <Input type="datetime-local" required value={form.scheduled_end}
              onChange={(e) => setForm({ ...form, scheduled_end: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="g-btn g-btn-primary w-full g-btn-touch" disabled={saving}>
          {saving ? t("shifts.form.saving") : t("shifts.form.submit")}
        </button>
      </form>
    </DialogContent>
  );
}
