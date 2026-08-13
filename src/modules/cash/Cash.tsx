import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useAuth } from "@/hooks/useAuth";
import { useOpenSession } from "@/hooks/useOpenSession";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MetricCard } from "@/components/shared/MetricCard";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import {
  LockOpen, LockKeyhole, ArrowDownToLine, ArrowUpFromLine,
  Banknote, CreditCard, Smartphone, QrCode, TrendingUp, Wallet,
} from "lucide-react";
import { PendingTableOrders } from "./PendingTableOrders";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

export default function Cash() {
  const { tenantId, branchId, hasRole } = useTenantContext();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { t } = useLanguage();
  const [openAmount, setOpenAmount] = useState("0");
  const [closeOpen, setCloseOpen] = useState(false);
  const [moveDialog, setMoveDialog] = useState<null | "in" | "out">(null);
  const [counts, setCounts] = useState({ cash: "", card: "", transfer: "", qr: "" });

  const { data: session } = useOpenSession(branchId);
  const canViewDifferences = hasRole("owner", "admin");

  const { data: history } = useQuery({
    queryKey: ["cash-history", branchId],
    enabled: !!branchId,
    queryFn: async () =>
      (await supabase.from("cash_sessions").select("*")
        .eq("branch_id", branchId!).order("opened_at", { ascending: false }).limit(20)).data ?? [],
  });

  const { data: movements } = useQuery({
    queryKey: ["cash-movements", session?.id],
    enabled: !!session?.id,
    queryFn: async () =>
      (await supabase.from("cash_movements").select("*")
        .eq("session_id", session!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const expectedCash = session
    ? Number(session.opening_amount) + Number(session.total_cash) + Number(session.total_in) - Number(session.total_out)
    : 0;

  const expectedTotal = session
    ? expectedCash + Number(session.total_card) + Number(session.total_transfer) + Number(session.total_qr)
    : 0;

  const openSession = async () => {
    if (!tenantId || !branchId || !user) return;
    const { error } = await supabase.rpc("open_cash_session" as any, {
      _tenant_id: tenantId,
      _branch_id: branchId,
      _opening_amount: Number(openAmount),
    });
    if (error) toast.error(error.message);
    else { toast.success(t("cash.success.opened")); qc.invalidateQueries(); }
  };

  const closeSession = async () => {
    if (!session) return;
    const { error } = await supabase.rpc("close_cash_session", {
      _session_id: session.id,
      _counted_amount: Number(counts.cash || 0),
      _notes: null,
      _counted_card: Number(counts.card || 0),
      _counted_transfer: Number(counts.transfer || 0),
      _counted_qr: Number(counts.qr || 0),
    } as any);
    if (error) toast.error(error.message);
    else {
      toast.success(t("cash.success.closed"));
      setCloseOpen(false);
      setCounts({ cash: "", card: "", transfer: "", qr: "" });
      qc.invalidateQueries();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="g-page-hd">
          <div className="g-page-hd-eyebrow">{t("cash.eyebrow")}</div>
          <div className="h-display g-page-title">{t("cash.title")}</div>
          <div className="g-page-hd-meta">{t("cash.subtitle")}</div>
        </div>
        {session && (
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" className="g-btn g-btn-ghost" onClick={() => setMoveDialog("in")}>
              <ArrowDownToLine size={16} className="mr-1" />{t("cash.action.income")}
            </button>
            <button type="button" className="g-btn g-btn-ghost" onClick={() => setMoveDialog("out")}>
              <ArrowUpFromLine size={16} className="mr-1" />{t("cash.action.expense")}
            </button>
            <button
              type="button"
              className="g-btn g-btn-primary"
              onClick={() => { setCounts({ cash: "", card: "", transfer: "", qr: "" }); setCloseOpen(true); }}
            >
              <LockKeyhole size={16} className="mr-1" />{t("cash.action.close_cash")}
            </button>
          </div>
        )}
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">{t("cash.tab.current")}</TabsTrigger>
          <TabsTrigger value="history">{t("cash.tab.history")}</TabsTrigger>
        </TabsList>

        {/* ── Current session tab ── */}
        <TabsContent value="current" className="mt-4 space-y-4">
          {!session ? (
            <div className="glass rounded-2xl p-8 max-w-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="orb orb-lg">
                  <LockKeyhole size={26} />
                </div>
                <div>
                  <div className="h-display-sm">{t("cash.closed.title")}</div>
                  <div className="g-page-hd-meta">{t("cash.closed.desc")}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="h-label">{t("cash.closed.initial_amount")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold g-prefix-muted">$</span>
                    <Input
                      type="number"
                      value={openAmount}
                      onChange={(e) => setOpenAmount(e.target.value)}
                      className="h-14 pl-8 text-2xl font-black tabular-nums border-2 focus:border-primary"
                    />
                  </div>
                </div>
                <button type="button" className="g-btn g-btn-primary g-btn-touch w-full" onClick={openSession}>
                  <LockOpen size={20} className="mr-2" />{t("cash.closed.open_now")}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* KPI metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard icon={Wallet} label={t("cash.kpi.opening")} value={formatCurrency(Number(session.opening_amount))} />
                <MetricCard icon={Banknote} label={t("cash.kpi.cash")} value={formatCurrency(Number(session.total_cash))} />
                <MetricCard icon={CreditCard} label={t("cash.kpi.card")} value={formatCurrency(Number(session.total_card))} />
                <MetricCard icon={Smartphone} label={t("cash.kpi.transfer")} value={formatCurrency(Number(session.total_transfer))} />
                <MetricCard icon={QrCode} label={t("cash.kpi.qr")} value={formatCurrency(Number(session.total_qr))} />
                <MetricCard
                  icon={TrendingUp}
                  label={canViewDifferences ? t("cash.kpi.expected_total") : t("cash.kpi.audit")}
                  value={canViewDifferences ? formatCurrency(expectedTotal) : t("cash.kpi.blind")}
                  accent
                />
              </div>

              {tenantId && branchId && (
                <PendingTableOrders tenantId={tenantId} branchId={branchId} />
              )}

              {/* Movements + summary */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                {/* Movements table */}
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="g-cash-sect-hd">
                    <ArrowDownToLine size={16} className="g-icon-brand" />
                    <div>
                      <div className="g-cash-sect-eyebrow">{t("cash.movements.eyebrow")}</div>
                      <div className="g-cash-sect-title">{t("cash.movements.title")}</div>
                    </div>
                  </div>

                  <div className="g-cash-mov-head">
                    <span>{t("cash.movements.col.time")}</span>
                    <span>{t("cash.movements.col.type")}</span>
                    <span className="text-right">{t("cash.movements.col.amount")}</span>
                    <span>{t("cash.movements.col.reason")}</span>
                  </div>

                  {(movements ?? []).length === 0 ? (
                    <div className="py-12 text-center g-page-hd-meta">
                      {t("cash.movements.empty")}
                    </div>
                  ) : (
                    (movements ?? []).map((m: any) => (
                      <div key={m.id} className="g-cash-mov-row">
                        <span className="g-cash-mov-time">
                          {new Date(m.created_at).toLocaleString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span>
                          <span className={m.type === "in" ? "g-pill g-pill-ok" : "g-pill g-pill-bad"}>
                            {m.type === "in" ? t("cash.action.income") : t("cash.action.expense")}
                          </span>
                        </span>
                        <span className="g-cash-mov-amount">{formatCurrency(Number(m.amount))}</span>
                        <span className="g-cash-mov-reason">{m.reason ?? "—"}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Summary card */}
                <div className="glass rounded-2xl p-5">
                  <div className="h-label-caps mb-4">
                    {t("cash.summary.title")}
                  </div>
                  <div className="g-cash-summary">
                    <div className="g-cash-summary-row">
                      <span>{t("cash.summary.sales")}</span>
                      <span className="g-cash-summary-val">
                        {formatCurrency(Number(session.total_cash) + Number(session.total_card) + Number(session.total_transfer) + Number(session.total_qr))}
                      </span>
                    </div>
                    <div className="g-cash-summary-row">
                      <span>{t("cash.summary.income")}</span>
                      <span className="g-cash-summary-val g-cash-summary-ok">
                        +{formatCurrency(Number(session.total_in))}
                      </span>
                    </div>
                    <div className="g-cash-summary-row">
                      <span>{t("cash.summary.expense")}</span>
                      <span className="g-cash-summary-val g-cash-summary-bad">
                        -{formatCurrency(Number(session.total_out))}
                      </span>
                    </div>
                    <div className="g-cash-summary-total">
                      <span>{canViewDifferences ? t("cash.summary.final_balance") : t("cash.summary.balance")}</span>
                      <span className="g-cash-summary-total-val">
                        {canViewDifferences ? formatCurrency(expectedTotal) : t("cash.kpi.blind")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── History tab ── */}
        <TabsContent value="history" className="mt-4">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="g-cash-hist-head">
              <span>{t("cash.history.col.open_close")}</span>
              <span>{t("cash.history.col.responsible")}</span>
              <span className="text-right">{t("cash.history.col.expected")}</span>
              <span className="text-right">{t("cash.history.col.counted")}</span>
              <span className="text-right">{t("cash.history.col.difference")}</span>
            </div>

            {(history ?? []).map((s: any) => {
              const diff = Number(s.difference);
              const diffClass = diff < 0
                ? "g-cash-hist-diff-bad"
                : diff > 0
                  ? "g-cash-hist-diff-ok"
                  : "g-cash-hist-diff-neu";

              return (
                <div key={s.id} className="g-cash-hist-row">
                  <div>
                    <div className="g-cash-hist-date-main">{new Date(s.opened_at).toLocaleDateString()}</div>
                    <div className="g-cash-hist-date-time">
                      {new Date(s.opened_at).toLocaleTimeString()} — {s.closed_at ? new Date(s.closed_at).toLocaleTimeString() : t("cash.history.status.open")}
                    </div>
                  </div>
                  <span className="g-cash-hist-dim">—</span>
                  <span className="g-cash-hist-num">
                    {canViewDifferences && s.expected_amount ? formatCurrency(Number(s.expected_amount)) : t("cash.history.restricted")}
                  </span>
                  <span className="g-cash-hist-num">
                    {s.closing_amount ? formatCurrency(Number(s.closing_amount)) : "—"}
                  </span>
                  <span className={cn(diffClass)}>
                    {canViewDifferences && s.difference
                      ? (diff > 0 ? "+" : "") + formatCurrency(diff)
                      : t("cash.history.restricted")}
                  </span>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Close session dialog */}
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/20">
            <DialogTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-primary" /> {t("cash.close_dialog.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest">{t("cash.close_dialog.cash_counted")}</Label>
              <Input
                type="number"
                value={counts.cash}
                onChange={(e) => setCounts({ ...counts, cash: e.target.value })}
                className="font-bold tabular-nums"
              />
            </div>
            <div className="space-y-3 border-t pt-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("cash.close_dialog.other_methods")}</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-[10px] flex items-center gap-1"><CreditCard className="h-3 w-3" /> {t("cash.close_dialog.card")}</div>
                  <Input type="number" value={counts.card} onChange={(e) => setCounts({ ...counts, card: e.target.value })} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] flex items-center gap-1"><Smartphone className="h-3 w-3" /> {t("cash.close_dialog.transfer")}</div>
                  <Input type="number" value={counts.transfer} onChange={(e) => setCounts({ ...counts, transfer: e.target.value })} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] flex items-center gap-1"><QrCode className="h-3 w-3" /> {t("cash.close_dialog.qr")}</div>
                  <Input type="number" value={counts.qr} onChange={(e) => setCounts({ ...counts, qr: e.target.value })} className="h-8 text-sm" />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-muted/30 text-center text-sm text-muted-foreground">
              {t("cash.close_dialog.note")}
            </div>
            <button type="button" className="g-btn g-btn-primary g-btn-touch w-full" onClick={closeSession}>
              {t("cash.close_dialog.finish")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash movement dialog */}
      <CashMovementDialog
        open={moveDialog !== null}
        type={moveDialog ?? "in"}
        sessionId={session?.id ?? null}
        onClose={() => { setMoveDialog(null); qc.invalidateQueries(); }}
      />
    </div>
  );
}

function CashMovementDialog({
  open, type, sessionId, onClose,
}: {
  open: boolean;
  type: "in" | "out";
  sessionId: string | null;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  const submit = async () => {
    if (!sessionId) return;
    setSaving(true);
    const { error } = await supabase.rpc("add_cash_movement", {
      _session_id: sessionId, _type: type, _amount: Number(amount), _reason: reason || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(type === "in" ? t("cash.movement.success.income") : t("cash.movement.success.expense"));
    setAmount(""); setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {type === "in" ? t("cash.movement.dialog.income") : t("cash.movement.dialog.expense")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t("cash.movement.form.amount")}</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("cash.movement.form.reason")}</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === "in" ? t("cash.movement.form.reason_income_ph") : t("cash.movement.form.reason_expense_ph")}
            />
          </div>
          <button
            type="button"
            className="g-btn g-btn-primary g-btn-touch w-full"
            disabled={saving || !amount}
            onClick={submit}
          >
            {t("cash.movement.form.submit")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
