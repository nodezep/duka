import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

const ROLES = ["owner", "admin", "manager", "cashier", "waiter", "courier", "kitchen", "inventory", "staff"] as const;

export default function Employees() {
  const { tenantId, branchId } = useTenantContext();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: employees } = useQuery({
    queryKey: ["employees", tenantId],
    enabled: !!tenantId,
    queryFn: async () => (await supabase.from("employees").select("*")
      .eq("tenant_id", tenantId!).order("full_name")).data ?? [],
  });

  const list = employees ?? [];

  const handleDelete = async (emp: any) => {
    if (!confirm(t("employees.delete_confirm").replace("{name}", emp.full_name))) return;
    setDeletingId(emp.id);
    try {
      const { error } = await supabase.from("employees").delete().eq("id", emp.id).eq("tenant_id", tenantId!);
      if (error) throw error;
      toast.success(t("employees.msg.deleted"));
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (err: any) {
      toast.error(err.message ?? t("common.error"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="orb"><Users className="h-5 w-5" /></div>
          <div>
            <div className="h-meta g-page-subtitle text-ink-400">{t("employees.meta")}</div>
            <h1 className="h-display g-page-title">{t("employees.title")}</h1>
            <div className="h-meta g-page-subtitle text-ink-500">
              {list.length} {list.length !== 1 ? t("employees.subtitle.plural") : t("employees.subtitle.single")}
            </div>
          </div>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingEmployee(null); }}>
          <DialogTrigger asChild>
            <button type="button" className="g-btn g-btn-primary" onClick={() => setEditingEmployee(null)}>
              <Plus className="h-4 w-4" /> {t("employees.new")}
            </button>
          </DialogTrigger>
          <EmployeeForm
            tenantId={tenantId!}
            branchId={branchId!}
            editing={editingEmployee}
            onClose={() => { setOpen(false); setEditingEmployee(null); qc.invalidateQueries({ queryKey: ["employees"] }); }}
          />
        </Dialog>
      </div>

      {list.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="orb mx-auto mb-4"><Users className="h-7 w-7" /></div>
          <h2 className="h-display font-semibold text-lg">{t("employees.empty.title")}</h2>
          <p className="h-meta g-page-subtitle text-ink-500 mt-1">{t("employees.empty.desc")}</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_120px_90px_70px] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400 border-b border-white/10">
            <span>{t("employees.col.name")}</span>
            <span>{t("auth.email") || "Email"}</span>
            <span>{t("employees.col.phone")}</span>
            <span>{t("employees.col.role")}</span>
            <span>{t("common.status")}</span>
            <span className="text-right">{t("common.action")}</span>
          </div>
          {list.map((e: any, idx: number) => (
            <div
              key={e.id}
              className={`grid grid-cols-[2fr_2fr_1fr_120px_90px_70px] gap-3 px-4 py-3 items-center hover:bg-white/5 transition-colors${idx < list.length - 1 ? " border-b border-white/10" : ""}`}
            >
              <span className="font-medium text-sm text-ink-900">{e.full_name}</span>
              <span className="text-sm text-ink-700">{e.email ?? "—"}</span>
              <span className="text-sm text-ink-700">{e.phone ?? "—"}</span>
              <span className="g-pill g-pill-ghost capitalize">{t(`role.${e.role}` as any) || e.role}</span>
              <span>
                {e.status === "active"
                  ? <span className="g-pill g-pill-ok">{t("employees.active")}</span>
                  : <span className="g-pill g-pill-ghost">{t("employees.inactive")}</span>
                }
              </span>
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  className="g-btn g-btn-ghost g-btn-icon"
                  title={t("employees.edit")}
                  aria-label={t("employees.edit")}
                  onClick={() => { setEditingEmployee(e); setOpen(true); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="g-btn g-btn-ghost g-btn-icon text-destructive hover:bg-destructive/10"
                  title={t("employees.delete")}
                  aria-label={t("employees.delete")}
                  disabled={deletingId === e.id}
                  onClick={() => handleDelete(e)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmployeeForm({ tenantId, branchId, editing, onClose }: { tenantId: string; branchId: string; editing?: any; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState<any>(editing ?? { full_name: "", email: "", phone: "", role: "cashier", pin: "", status: "active" });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing?.id) {
        const { error } = await supabase.from("employees").update({
          full_name: form.full_name,
          email: form.email || null,
          phone: form.phone || null,
          role: form.role,
          pin: form.pin || null,
          status: form.status,
        }).eq("id", editing.id).eq("tenant_id", tenantId);
        if (error) throw error;
        toast.success(t("employees.msg.updated"));
      } else {
        const { error } = await supabase.from("employees").insert({
          ...form,
          tenant_id: tenantId,
          branch_id: branchId,
          email: form.email || null,
          phone: form.phone || null,
          pin: form.pin || null,
        });
        if (error) throw error;
        toast.success(t("employees.msg.created"));
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{editing ? t("employees.form.title.edit") : t("employees.form.title.new")}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label>{t("employees.form.fullname")}</Label>
          <Input
            required
            placeholder={t("employees.form.fullname_ph")}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("auth.email") || "Email"}</Label>
            <Input
              type="email"
              placeholder={t("employees.form.email_ph")}
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("employees.col.phone")}</Label>
            <Input
              type="tel"
              placeholder={t("employees.form.phone_ph")}
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("employees.col.role")}</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{t(`role.${r}` as any) || r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("employees.form.pin")}</Label>
            <Input
              placeholder={t("employees.form.pin_ph")}
              value={form.pin ?? ""}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>{t("employees.active")}</Label>
          <Switch
            checked={form.status === "active"}
            onCheckedChange={(c) => setForm({ ...form, status: c ? "active" : "inactive" })}
          />
        </div>
        <button type="submit" disabled={saving} className="g-btn g-btn-primary w-full g-btn-touch">
          {editing ? t("employees.form.save") : t("employees.form.submit")}
        </button>
      </form>
    </DialogContent>
  );
}
