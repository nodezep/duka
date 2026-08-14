import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import {
  Banknote, CreditCard, QrCode, Loader2, Heart, Tag,
  Smartphone, Building2, Send, CheckCircle2, PhoneCall,
} from "lucide-react";
import { NumPad } from "./NumPad";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  TANZANIA_MOBILE_PROVIDERS,
  detectProviderFromPhone,
  type MobileMoneyProvider,
} from "@/lib/payments/types";
import { initiateMobileMoneyPayment } from "@/lib/payments/mobileMoney";

export type PayMethod =
  | "cash"
  | "card"
  | "mpesa"
  | "tigopesa"
  | "airtelmoney"
  | "halopesa"
  | "bank"
  | "qr"
  | "transfer";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  total: number;
  tenantId?: string | null;
  submitting: boolean;
  onConfirm: (
    method: PayMethod,
    tendered: number,
    tip: number,
    couponCode?: string,
    discount?: number,
    metadata?: { phone?: string; reference?: string }
  ) => void;
}

const SHORTCUTS = [5000, 10000, 20000, 50000];

const TIP_SUGGESTIONS = [
  { label: "0%", value: 0 },
  { label: "5%", percent: 0.05 },
  { label: "10%", percent: 0.1 },
  { label: "15%", percent: 0.15 },
];

export function PaymentDialog({
  open,
  onOpenChange,
  total,
  tenantId,
  submitting,
  onConfirm,
}: PaymentDialogProps) {
  const { t } = useLanguage();
  const [method, setMethod] = useState<PayMethod>("cash");
  const [tendered, setTendered] = useState<string>("");
  const [tip, setTip] = useState<number>(0);
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Mobile Money fields
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [ussdSending, setUssdSending] = useState(false);
  const [ussdSuccess, setUssdSuccess] = useState(false);

  const METHODS: { id: PayMethod; label: string; icon: any; badge?: string; color?: string }[] = [
    { id: "cash", label: t("pay.cash"), icon: Banknote },
    { id: "mpesa", label: "M-Pesa", icon: Smartphone, badge: "Vodacom", color: "text-red-500" },
    { id: "tigopesa", label: "Tigo Pesa", icon: Smartphone, badge: "Mixx", color: "text-blue-500" },
    { id: "airtelmoney", label: "Airtel Money", icon: Smartphone, badge: "Airtel", color: "text-rose-500" },
    { id: "halopesa", label: "HaloPesa", icon: Smartphone, badge: "Halotel", color: "text-amber-500" },
    { id: "card", label: t("pay.card"), icon: CreditCard, badge: "Visa/MC" },
    { id: "bank", label: t("pay.bank"), icon: Building2, badge: "NMB/CRDB" },
    { id: "qr", label: t("pay.qr"), icon: QrCode },
  ];

  useEffect(() => {
    if (open) {
      setMethod("cash");
      setTendered(String(Math.round(total)));
      setTip(0);
      setCoupon("");
      setCouponDiscount(0);
      setPhone("");
      setReference("");
      setUssdSending(false);
      setUssdSuccess(false);
    }
  }, [open, total]);

  const isMobileMoney =
    method === "mpesa" ||
    method === "tigopesa" ||
    method === "airtelmoney" ||
    method === "halopesa" ||
    method === "bank";

  const detectedCarrier = phone ? detectProviderFromPhone(phone) : null;

  const tenderedNum = Number(tendered) || 0;
  const discountedTotal = Math.max(0, total - couponDiscount);
  const grandTotal = discountedTotal + tip;
  const change = method === "cash" ? Math.max(0, tenderedNum - grandTotal) : 0;
  const insufficient = method === "cash" && tenderedNum < grandTotal;

  const handleTipPercent = (p: number) => {
    setTip(Math.round(discountedTotal * p));
  };

  useEffect(() => {
    if (method !== "cash") {
      setTendered(String(Math.round(grandTotal)));
    }
  }, [grandTotal, method]);

  // Handle USSD Push simulation
  const handleSendUssdPush = async () => {
    if (!phone.trim()) {
      return toast.error("Weka nambari ya simu ya mteja (k.m. 0754 123 456)");
    }
    setUssdSending(true);
    try {
      const res = await initiateMobileMoneyPayment({
        tenantId: tenantId ?? "default",
        amount: grandTotal,
        currency: "TZS",
        method,
        phoneNumber: phone.trim(),
        description: "POS Payment",
      });
      if (res.success) {
        setUssdSuccess(true);
        setReference(res.transactionId);
        toast.success(t("pay.prompt_sent") || res.providerMessage);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Hitilafu wakati wa kutuma ombi la USSD");
    } finally {
      setUssdSending(false);
    }
  };

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setCouponDiscount(0);
      return;
    }
    if (!tenantId) return toast.error(t("pay.no_tenant"));
    setValidatingCoupon(true);
    try {
      const { data, error } = await supabase
        .from("discount_codes" as any)
        .select("code, discount_type, discount_value, starts_at, expires_at, max_uses, current_uses, is_active")
        .eq("tenant_id", tenantId)
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      const now = Date.now();
      if (
        !data ||
        new Date(data.starts_at).getTime() > now ||
        (data.expires_at && new Date(data.expires_at).getTime() < now)
      ) {
        setCouponDiscount(0);
        return toast.error(t("pay.invalid_coupon"));
      }
      if (data.max_uses != null && Number(data.current_uses) >= Number(data.max_uses)) {
        setCouponDiscount(0);
        return toast.error(t("pay.no_uses"));
      }
      const rawDiscount =
        data.discount_type === "percentage"
          ? total * (Number(data.discount_value) / 100)
          : Number(data.discount_value);
      const discount = Math.min(total, Math.max(0, Math.round(rawDiscount)));
      setCouponDiscount(discount);
      toast.success(`${t("pay.coupon_applied")} · -${formatCurrency(discount)}`);
    } catch (e: any) {
      toast.error(e.message ?? t("pay.coupon_failed"));
    } finally {
      setValidatingCoupon(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-[var(--g-hairline)]">
          <DialogTitle className="text-xl flex items-baseline justify-between">
            <span className="h-display text-xl">{t("pay.title")}</span>
            <div className="text-right">
              <div className="h-meta">{t("pay.total_payable")}</div>
              <div className="h-num text-3xl text-brand-600">{formatCurrency(grandTotal)}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_340px] gap-0 h-[560px]">
          {/* Left Panel: Payment methods & Mobile Money options */}
          <div className="p-6 border-r border-[var(--g-hairline)] overflow-y-auto space-y-6">
            {/* Payment Method Selector Grid */}
            <div className="space-y-2.5">
              <div className="h-label uppercase tracking-widest">{t("pay.method")}</div>
              <div className="grid grid-cols-4 gap-2">
                {METHODS.map((m) => {
                  const active = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMethod(m.id);
                        if (m.id !== "cash") setTendered(String(grandTotal));
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition-all active:scale-95 text-center relative",
                        active
                          ? "border-[var(--brand-600)] bg-primary/10 text-foreground font-bold shadow-sm"
                          : "border-[var(--g-hairline)] glass text-muted-foreground hover:border-[var(--brand-600)]/40 hover:text-foreground"
                      )}
                    >
                      <m.icon className={cn("h-5 w-5", m.color)} />
                      <span className="text-xs font-semibold leading-tight line-clamp-1">{m.label}</span>
                      {m.badge && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-normal">
                          {m.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Money Prompt Panel */}
            {isMobileMoney && (
              <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    {method === "bank" ? "Malipo ya Benki (NMB / CRDB)" : "Malipo kwa Simu (Mobile Money)"}
                  </span>
                  {detectedCarrier && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                      {TANZANIA_MOBILE_PROVIDERS[detectedCarrier]?.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <span>🇹🇿</span> {t("pay.phone_number")}
                    </label>
                    <div className="relative">
                      <Input
                        type="tel"
                        placeholder="0754 000 000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      {t("pay.reference_code")}
                    </label>
                    <Input
                      type="text"
                      placeholder="k.m. QD82TR439X"
                      value={reference}
                      onChange={(e) => setReference(e.target.value.toUpperCase())}
                      className="font-mono text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSendUssdPush}
                    disabled={ussdSending || !phone.trim()}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer",
                      ussdSuccess
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                    )}
                  >
                    {ussdSending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Inatuma ombi la USSD...
                      </>
                    ) : ussdSuccess ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ombi Limetumwa (USSD Sent)
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> {t("pay.send_prompt")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tip Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-label uppercase tracking-widest flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-[var(--g-bad)]" /> {t("pay.tip")}
                </div>
                <div className="text-sm font-bold tabular-nums text-g-bad">
                  {tip > 0 ? "+" + formatCurrency(tip) : t("pay.no_tip")}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TIP_SUGGESTIONS.map((s) => {
                  const isActive =
                    tip === (s.percent ? Math.round(total * s.percent) : s.value);
                  return (
                    <button
                      key={s.label}
                      type="button"
                      className={cn(
                        "g-pill g-pill-h28 transition-all",
                        isActive ? "g-pill-bad" : "g-pill-ghost"
                      )}
                      onClick={() =>
                        s.percent !== undefined
                          ? handleTipPercent(s.percent)
                          : setTip(s.value)
                      }
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 h-meta text-xs">Tsh</span>
                <Input
                  type="number"
                  placeholder={t("pay.custom_tip")}
                  className="pl-10"
                  value={tip || ""}
                  onChange={(e) => setTip(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Coupon Code */}
            <div className="space-y-2.5 pt-1">
              <div className="h-label uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> {t("pay.discount_coupon")}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={t("pay.enter_code")}
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value.toUpperCase());
                    setCouponDiscount(0);
                  }}
                  className="uppercase font-mono"
                />
                <button
                  type="button"
                  className="g-btn g-btn-ghost px-4"
                  onClick={applyCoupon}
                  disabled={validatingCoupon}
                >
                  {validatingCoupon ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("pay.apply")
                  )}
                </button>
              </div>
              {couponDiscount > 0 && (
                <div className="text-xs font-semibold text-[var(--g-ok)]">
                  {t("pay.discount_applied")}: -{formatCurrency(couponDiscount)}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: NumPad & Summary */}
          <div className="p-6 glass-thin flex flex-col justify-between">
            <div className="space-y-4">
              <div className="glass rounded-xl px-4 py-3">
                <div className="h-label uppercase tracking-widest mb-1">
                  {method === "cash" ? t("pay.cash_received") : t("pay.confirm_amount")}
                </div>
                <div className="h-num text-3xl">{formatCurrency(tenderedNum)}</div>
              </div>

              <NumPad
                value={tendered}
                onChange={setTendered}
                shortcuts={method === "cash" ? SHORTCUTS : undefined}
                onShortcut={(n) => setTendered(String(tenderedNum + n))}
              />

              {method === "cash" && (
                <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="h-label uppercase tracking-wider">{t("pay.change")}</span>
                  <span
                    className={cn(
                      "h-num text-xl",
                      insufficient ? "text-[var(--g-bad)]" : "text-[var(--g-ok)]"
                    )}
                  >
                    {insufficient
                      ? t("pay.missing") + formatCurrency(grandTotal - tenderedNum)
                      : formatCurrency(change)}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="g-btn g-btn-primary g-btn-touch w-full text-lg font-black shadow-lg mt-4"
              disabled={submitting || insufficient}
              onClick={() =>
                onConfirm(
                  method,
                  tenderedNum,
                  tip,
                  couponDiscount > 0 ? coupon.trim().toUpperCase() : undefined,
                  couponDiscount,
                  isMobileMoney ? { phone: phone.trim(), reference: reference.trim() } : undefined
                )
              }
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {t("pay.pay")} {formatCurrency(grandTotal)}
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
