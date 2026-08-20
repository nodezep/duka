import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Store, Package,
  Wallet, ShoppingCart, Users, BarChart3, HelpCircle, X, ChevronRight,
  BookOpen, PlayCircle, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface GuideStep {
  id: string;
  number: number;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
  icon: any;
  route: string;
  actionHintKey: string;
  defaultActionHint: string;
  details: string[];
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: "categories_setup",
    number: 1,
    titleKey: "guide.step1.title",
    defaultTitle: "1. Create Product Categories First",
    descKey: "guide.step1.desc",
    defaultDesc: "Start by creating your shop departments/categories before adding individual products.",
    icon: Store,
    route: "/categories",
    actionHintKey: "guide.step1.hint",
    defaultActionHint: "Go to Categories to set up departments for your shop.",
    details: [
      "Navigate to 'Catalog > Categories' from the sidebar.",
      "Click '+ New Category' to add your business categories (e.g. Tools, Electrical, Plumbing, Stationery, Electronics, Drinks, Groceries).",
      "Having categories ready makes product entry fast and clean.",
    ],
  },
  {
    id: "add_products",
    number: 2,
    titleKey: "guide.step2.title",
    defaultTitle: "2. Add Products & Pricing",
    descKey: "guide.step2.desc",
    defaultDesc: "Enter your items with selling price, cost price, barcode, and min stock threshold.",
    icon: Package,
    route: "/products",
    actionHintKey: "guide.step2.hint",
    defaultActionHint: "Open Products to enter items or import via CSV.",
    details: [
      "Go to 'Products' from the sidebar.",
      "Click '+ New Product' and fill in the Name, Price, Cost, and assign the Category.",
      "For standard retail stores (hardware, stationery, computer shops), keep product type as 'Simple' and leave preparation station (KDS) unassigned.",
      "Enter a barcode or click the Scan button to use a barcode scanner.",
    ],
  },
  {
    id: "inventory_stock",
    number: 3,
    titleKey: "guide.step3.title",
    defaultTitle: "3. Stock & Inventory Quantities",
    descKey: "guide.step3.desc",
    defaultDesc: "Set starting inventory counts, receive supplier goods, and monitor low stock alerts.",
    icon: BarChart3,
    route: "/inventory",
    actionHintKey: "guide.step3.hint",
    defaultActionHint: "Open Inventory to adjust starting stock and track movements.",
    details: [
      "Go to 'Inventory' to view real-time stock levels.",
      "Click '+ Movement / Adjustment' to enter your starting quantities on shelf or warehouse.",
      "Use 'Suppliers' to generate purchase orders and auto-replenish stock on delivery.",
    ],
  },
  {
    id: "staff_setup",
    number: 4,
    titleKey: "guide.step4.title",
    defaultTitle: "4. Staff, Cashiers & PINs",
    descKey: "guide.step4.desc",
    defaultDesc: "Create employee profiles, assign POS/Cashier roles, and set secure login PINs.",
    icon: Users,
    route: "/employees",
    actionHintKey: "guide.step4.hint",
    defaultActionHint: "Go to Employees to add staff and configure access PINs.",
    details: [
      "Go to 'Staff > Employees' from the sidebar.",
      "Click '+ New Employee' and enter employee name, role (Cashier, Manager, Staff), and 4-digit PIN.",
      "Staff can quickly switch user or unlock the POS cash register with their PIN.",
    ],
  },
  {
    id: "cash_session",
    number: 5,
    titleKey: "guide.step5.title",
    defaultTitle: "5. Open Cash Register (Daily Float)",
    descKey: "guide.step5.desc",
    defaultDesc: "Before selling, open a daily cash drawer session with your base opening float.",
    icon: Wallet,
    route: "/cash",
    actionHintKey: "guide.step5.hint",
    defaultActionHint: "Open Cash to enter opening float and manage daily money movements.",
    details: [
      "Go to 'Cash & Drawer' from the sidebar.",
      "Enter your Opening Amount (e.g. 50,000 TZS / $50 in cash drawer).",
      "Click 'Open Cash Session' to enable sales and track cash in/out.",
    ],
  },
  {
    id: "pos_sales",
    number: 6,
    titleKey: "guide.step6.title",
    defaultTitle: "6. Ring Up Sales & Collect Payment",
    descKey: "guide.step6.desc",
    defaultDesc: "Sell products quickly via touch POS, barcode scanner, or instant search.",
    icon: ShoppingCart,
    route: "/pos",
    actionHintKey: "guide.step6.hint",
    defaultActionHint: "Go to POS to ring items, choose payment method, and complete sales.",
    details: [
      "Open 'POS'. Tap items to add to cart or scan barcode with scanner.",
      "Click 'Pay' and select payment: Cash, M-Pesa / Tigo Pesa / Airtel Money, Card, or Bank transfer.",
      "Enter tendered amount to see change, and print or share receipt.",
    ],
  },
  {
    id: "close_cash",
    number: 7,
    titleKey: "guide.step7.title",
    defaultTitle: "7. Close Shift & Audit Reports",
    descKey: "guide.step7.desc",
    defaultDesc: "Reconcile counted cash with system sales, close the drawer, and analyze reports.",
    icon: BarChart3,
    route: "/reports",
    actionHintKey: "guide.step7.hint",
    defaultActionHint: "Go to Cash to close session and Reports to view sales analytics.",
    details: [
      "Go to 'Cash' at the end of the shift.",
      "Click 'Close Session' and enter your physical cash count.",
      "System highlights any surplus or shortage and records audit logs.",
      "Check 'Reports' to view daily revenue, best sellers, and profit margins.",
    ],
  },
];

export function InteractiveOnboardingGuide() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("app_completed_guide_steps");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem("app_guide_banner_dismissed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("app_completed_guide_steps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-system-guide", handleOpen);
    return () => window.removeEventListener("open-system-guide", handleOpen);
  }, []);

  const currentStep = GUIDE_STEPS[activeStepIndex];

  const handleStepClick = (index: number) => {
    setActiveStepIndex(index);
    const step = GUIDE_STEPS[index];
    if (step && location.pathname !== step.route) {
      navigate(step.route);
    }
  };

  const markStepDone = (id: string) => {
    if (!completedSteps.includes(id)) {
      setCompletedSteps((prev) => [...prev, id]);
    }
    if (activeStepIndex < GUIDE_STEPS.length - 1) {
      handleStepClick(activeStepIndex + 1);
    }
  };

  const toggleStepDone = (id: string) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const progressPercent = Math.round((completedSteps.length / GUIDE_STEPS.length) * 100);

  return (
    <>
      {/* Top Banner Widget for Beginners */}
      {!bannerDismissed && progressPercent < 100 && (
        <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-accent/15 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-4 text-xs z-30 relative backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <span>{t("guide.banner.title") || "Step-by-Step Store Setup Guide"}</span>
                <Badge variant="outline" className="text-[10px] h-4 py-0 font-normal">
                  {completedSteps.length}/{GUIDE_STEPS.length} {t("guide.banner.completed") || "Completed"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-[11px] truncate">
                {t(currentStep.titleKey) || currentStep.defaultTitle}: {t(currentStep.descKey) || currentStep.defaultDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs gap-1.5 shadow-sm"
              onClick={() => setIsOpen(true)}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              {t("guide.banner.open_manual") || "Open Step Manual"}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setBannerDismissed(true);
                localStorage.setItem("app_guide_banner_dismissed", "true");
              }}
              title={t("common.cancel") || "Dismiss banner"}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Full Manual Modal & Guided Tour */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border bg-background shadow-2xl">
          <div className="grid md:grid-cols-[280px_1fr] h-[600px] max-h-[85vh]">
            {/* Left Steps Navigation */}
            <div className="bg-muted/40 border-r flex flex-col p-4 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <BookOpen className="h-4 w-4" />
                  <span>{t("guide.modal.title") || "System Master Manual"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t("guide.modal.subtitle") || "Complete step-by-step guide to run your POS, stock, and cash"}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                  <span>{t("guide.modal.progress") || "Setup Progress"}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Steps List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 pt-2">
                {GUIDE_STEPS.map((step, idx) => {
                  const isCurrent = activeStepIndex === idx;
                  const isDone = completedSteps.includes(step.id);
                  const Icon = step.icon;
                  return (
                    <button
                      type="button"
                      key={step.id}
                      onClick={() => handleStepClick(idx)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-all",
                        isCurrent
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "h-6 w-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold",
                          isCurrent
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : isDone
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                      </div>
                      <div className="min-w-0 flex-1 truncate">
                        {t(step.titleKey) || step.defaultTitle}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t flex justify-between items-center text-[11px] text-muted-foreground">
                <button
                  type="button"
                  className="hover:underline flex items-center gap-1"
                  onClick={() => {
                    setCompletedSteps([]);
                    localStorage.removeItem("app_completed_guide_steps");
                  }}
                >
                  <RotateCcw className="h-3 w-3" /> {t("guide.modal.reset") || "Reset Progress"}
                </button>
              </div>
            </div>

            {/* Right Step Details */}
            <div className="flex flex-col h-full overflow-y-auto p-6 justify-between">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="outline" className="text-xs mb-2">
                      {t("guide.modal.step_badge") || "Step"} {currentStep.number} of {GUIDE_STEPS.length}
                    </Badge>
                    <h2 className="text-xl font-bold text-foreground">
                      {t(currentStep.titleKey) || currentStep.defaultTitle}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {t(currentStep.descKey) || currentStep.defaultDesc}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <currentStep.icon className="h-6 w-6" />
                  </div>
                </div>

                {/* Instructions breakdown */}
                <div className="space-y-3 bg-muted/30 border rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("guide.modal.instructions_title") || "How to do this:"}
                  </h3>
                  <div className="space-y-2.5">
                    {currentStep.details.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action shortcut banner */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/30 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span>{t(currentStep.actionHintKey) || currentStep.defaultActionHint}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 ml-3 shrink-0"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(currentStep.route);
                    }}
                  >
                    <span>{t("guide.modal.go_to_section") || "Open Screen"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between border-t pt-4 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={activeStepIndex === 0}
                  onClick={() => handleStepClick(activeStepIndex - 1)}
                  className="gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> {t("common.back") || "Previous"}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant={completedSteps.includes(currentStep.id) ? "outline" : "default"}
                    size="sm"
                    onClick={() => markStepDone(currentStep.id)}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {completedSteps.includes(currentStep.id)
                      ? (t("guide.modal.completed_btn") || "Marked as Done ✓")
                      : (t("guide.modal.mark_done") || "Done & Next Step")}
                  </Button>

                  {activeStepIndex < GUIDE_STEPS.length - 1 ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStepClick(activeStepIndex + 1)}
                      className="gap-1"
                    >
                      {t("common.next") || "Next"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("guide.modal.finish") || "Finish Guide"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GuideLauncherButton({ onClick }: { onClick?: () => void }) {
  const { t } = useLanguage();
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 text-xs rounded-lg border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary font-medium"
      onClick={onClick || (() => window.dispatchEvent(new CustomEvent("open-system-guide")))}
    >
      <BookOpen className="h-3.5 w-3.5" />
      <span>{t("guide.topbar.btn") || "System Guide"}</span>
    </Button>
  );
}
