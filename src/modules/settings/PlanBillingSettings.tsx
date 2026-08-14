import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTenantContext } from "@/hooks/useTenantContext";
import { formatCurrency } from "@/lib/format";
import {
  Sparkles, Check, ShieldCheck, Zap, Smartphone,
  Building2, CreditCard, Loader2, CheckCircle2, ArrowRight,
  Receipt, HelpCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  TANZANIA_MOBILE_PROVIDERS,
  TANZANIA_BANKS,
  detectProviderFromPhone,
  type MobileMoneyProvider,
  type BankProvider,
} from "@/lib/payments/types";
import { initiateMobileMoneyPayment } from "@/lib/payments/mobileMoney";

interface PlanItem {
  id: "starter" | "pro" | "enterprise";
  name: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanItem[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Inafaa kwa kuanza biashara ndogo au kaunta moja.",
    features: [
      "Tawi 1 la biashara",
      "Kituo kikuu cha POS",
      "Keshia na usimamizi wa mauzo",
      "Ripoti za kimsingi za kila siku",
      "Risiti za wateja",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    popular: true,
    badge: "Inayopendwa Zaidi",
    monthlyPrice: 30000,
    yearlyPrice: 300000,
    description: "Kwa mikahawa, maduka na biashara zinazokua kwa kasi.",
    features: [
      "Matawi yasiyo na kikomo",
      "Usimamizi kamili wa Meza & Maagizo ya Mesero",
      "KDS (Skrini ya Jikoni)",
      "Usimamizi wa Domicilios / Domiciliarios",
      "Maagizo ya kidijitali (WhatsApp AI / Mtandaoni)",
      "Stoki ya kina & arifa za bidhaa kuisha",
      "Usimamizi wa wafanyakazi na zamu (Shifts)",
      "Msaada wa kipaumbele 24/7",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 299000,
    yearlyPrice: 2990000,
    description: "Kwa mashirika makubwa yenye minyororo ya maduka.",
    features: [
      "Kila kitu kilicho kwenye Pro",
      "SLA ya 99.9% iliyohakikishwa",
      "Ujumuishaji maalum wa mifumo ya ERP & TRA EFD",
      "Mafunzo na onboarding ya ana kwa ana",
      "Meneja maalum wa akaunti yako",
    ],
  },
];

export default function PlanBillingSettings() {
  const { t } = useLanguage();
  const { tenantId, hasRole } = useTenantContext();
  const canEdit = hasRole("owner", "admin");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentPlanId, setCurrentPlanId] = useState<"starter" | "pro" | "enterprise">("pro");
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Checkout modal states
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "tigopesa" | "airtelmoney" | "halopesa" | "bank" | "card">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankProvider>("crdb");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"input" | "prompt_sent" | "success">("input");

  const handleOpenUpgrade = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setPaymentStep("input");
    setPhoneNumber("");
    setReferenceNumber("");
    setCheckoutOpen(true);
  };

  const detectedCarrier = phoneNumber ? detectProviderFromPhone(phoneNumber) : null;

  const getPlanPrice = (plan: PlanItem) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const handleExecutePayment = async () => {
    if (!selectedPlan) return;

    if (paymentMethod !== "card" && !phoneNumber.trim() && !referenceNumber.trim()) {
      return toast.error("Tafadhali weka nambari ya simu au nambari ya muamala ya SMS");
    }

    setProcessing(true);
    try {
      const amount = getPlanPrice(selectedPlan);
      const res = await initiateMobileMoneyPayment({
        tenantId: tenantId ?? "default",
        amount,
        currency: "TZS",
        method: paymentMethod,
        phoneNumber: phoneNumber.trim(),
        referenceNumber: referenceNumber.trim(),
        description: `Malipo ya kifurushi cha ${selectedPlan.name} (${billingCycle})`,
      });

      if (res.success) {
        setPaymentStep("prompt_sent");
        // Simulate immediate USSD confirmation from telecom network
        setTimeout(() => {
          setPaymentStep("success");
          setCurrentPlanId(selectedPlan.id);
          toast.success(t("billing.upgrade_success") || "Malipo yamethibitishwa!");
        }, 2200);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Hitilafu wakati wa kusindika malipo");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="glass p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-muted/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" /> {t("billing.title")}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              Boresha Biashara Yako na ElyonPOS360T
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              {t("billing.subtitle")}
            </p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center bg-muted/80 p-1.5 rounded-2xl border border-border shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer",
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("billing.monthly")}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                billingCycle === "yearly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{t("billing.yearly")}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-bold">
                -17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const price = getPlanPrice(plan);

          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative",
                plan.popular
                  ? "glass border-2 border-primary shadow-xl shadow-primary/10 bg-primary/[0.02]"
                  : "glass border border-border shadow-sm hover:border-primary/40"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-extrabold uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                    {plan.description}
                  </p>
                </div>

                <div className="py-2 border-y border-border/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">
                      {price === 0 ? "Bure" : formatCurrency(price)}
                    </span>
                    {price > 0 && (
                      <span className="text-xs font-medium text-muted-foreground">
                        / {billingCycle === "monthly" ? "mwezi" : "mwaka"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Huduma zilizojumuishwa:
                  </div>
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-border/60">
                {isCurrent ? (
                  <div className="w-full py-2.5 px-4 rounded-xl border border-border bg-muted/60 text-muted-foreground text-center text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {t("billing.current_plan")}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenUpgrade(plan)}
                    disabled={!canEdit}
                    className={cn(
                      "w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 active:scale-[0.98]"
                        : "border border-border glass hover:bg-muted text-foreground active:scale-[0.98]"
                    )}
                  >
                    <span>{t("billing.upgrade_btn")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Money & Local Payment Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-3xl">
          <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/30">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Lipa Kifurushi cha {selectedPlan?.name}
            </DialogTitle>
          </DialogHeader>

          {paymentStep === "input" && (
            <div className="p-6 space-y-5">
              {/* Summary Pill */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <div>
                  <div className="text-xs text-muted-foreground">Kifurushi ulichochagua:</div>
                  <div className="text-sm font-bold text-foreground">
                    {selectedPlan?.name} · ({billingCycle === "monthly" ? "Mwezi 1" : "Mwaka 1"})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Jumla ya Kulipa:</div>
                  <div className="text-lg font-black text-primary">
                    {selectedPlan ? formatCurrency(getPlanPrice(selectedPlan)) : "0"}
                  </div>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">
                  Chagua Njia ya Malipo (Payment Method):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mpesa")}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer",
                      paymentMethod === "mpesa"
                        ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm"
                        : "border-border hover:bg-muted text-foreground"
                    )}
                  >
                    <Smartphone className="h-5 w-5 text-red-500" />
                    <span>M-Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("tigopesa")}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer",
                      paymentMethod === "tigopesa"
                        ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "border-border hover:bg-muted text-foreground"
                    )}
                  >
                    <Smartphone className="h-5 w-5 text-blue-500" />
                    <span>Tigo Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("airtelmoney")}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer",
                      paymentMethod === "airtelmoney"
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm"
                        : "border-border hover:bg-muted text-foreground"
                    )}
                  >
                    <Smartphone className="h-5 w-5 text-rose-500" />
                    <span>Airtel Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("halopesa")}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer",
                      paymentMethod === "halopesa"
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "border-border hover:bg-muted text-foreground"
                    )}
                  >
                    <Smartphone className="h-5 w-5 text-amber-500" />
                    <span>HaloPesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer",
                      paymentMethod === "bank"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border hover:bg-muted text-foreground"
                    )}
                  >
                    <Building2 className="h-5 w-5 text-primary" />
                    <span>NMB / CRDB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer",
                      paymentMethod === "card"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border hover:bg-muted text-foreground"
                    )}
                  >
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Visa / Kadi</span>
                  </button>
                </div>
              </div>

              {/* Mobile details */}
              {paymentMethod !== "card" && paymentMethod !== "bank" && (
                <div className="space-y-3 p-4 rounded-2xl border border-border bg-muted/40">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>🇹🇿</span> Nambari ya Simu ya {paymentMethod.toUpperCase()}:
                      </span>
                      {detectedCarrier && (
                        <span className="text-[10px] text-primary font-bold">
                          {TANZANIA_MOBILE_PROVIDERS[detectedCarrier]?.name}
                        </span>
                      )}
                    </label>
                    <Input
                      type="tel"
                      placeholder="0754 123 456"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Au weka nambari ya risiti/muamala (SMS reference):
                    </label>
                    <Input
                      type="text"
                      placeholder="k.m. QD92TR784X"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                      className="font-mono text-sm uppercase"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="space-y-3 p-4 rounded-2xl border border-border bg-muted/40">
                  <label className="text-xs font-semibold text-muted-foreground">Chagua Benki:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TANZANIA_BANKS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBank(b.id)}
                        className={cn(
                          "p-2.5 rounded-xl border text-xs font-bold transition-all text-center",
                          selectedBank === b.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:bg-muted"
                        )}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground pt-1">
                    Lipa kwa Namba ya Kampuni / Control Number: <strong className="text-foreground">9988231</strong>
                  </div>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="p-4 rounded-2xl border border-border bg-muted/40 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Nambari ya Kadi (Card Number):</label>
                    <Input type="text" placeholder="4000 1234 5678 9010" className="font-mono text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="text" placeholder="MM/YY" className="font-mono text-sm" />
                    <Input type="text" placeholder="CVV" className="font-mono text-sm" />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={processing}
                className="w-full py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Inatuma ombi la malipo...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Lipa Sasa · {selectedPlan ? formatCurrency(getPlanPrice(selectedPlan)) : ""}
                  </>
                )}
              </button>
            </div>
          )}

          {paymentStep === "prompt_sent" && (
            <div className="p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="h-16 w-16 rounded-full bg-primary/15 text-primary mx-auto flex items-center justify-center animate-pulse">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Ombi la Malipo (USSD Push) Limetumwa!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Tafadhali kagua simu yako <strong>{phoneNumber}</strong> na uweke <strong>PIN</strong> yako ya{" "}
                {paymentMethod.toUpperCase()} ili kuidhinisha malipo.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-primary font-semibold">
                <Loader2 className="h-4 w-4 animate-spin" /> Inasubiri uthibitisho kutoka kwa mtandao...
              </div>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Hongera! Malipo Yamekamilika
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Kifurushi chako cha <strong>{selectedPlan?.name}</strong> kimeamilishwa kikamilifu kwenye akaunti yako.
              </p>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="py-2.5 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
              >
                Funga na Uendelee
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
