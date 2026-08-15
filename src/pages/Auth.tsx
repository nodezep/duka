import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GearMark } from "@/components/shared/GearMark";
import { LiveDot } from "@/components/shared/LiveDot";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import {
  Loader2, Shield, Zap, Wifi, ArrowLeft,
  ShoppingCart, UtensilsCrossed, BarChart3, Sun, Moon,
} from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { cn } from "@/lib/utils";

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { mode, toggleMode } = useThemeStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = t("auth.doc.title");
  }, [t]);

  const FEATURES = [
    { icon: Zap, text: t("auth.feat.1") },
    { icon: Wifi, text: t("auth.feat.2") },
    { icon: Shield, text: t("auth.feat.3") },
  ];

  const PROOF = [
    { icon: ShoppingCart, label: t("auth.stat.sales.lbl"), value: t("auth.stat.sales.val") },
    { icon: UtensilsCrossed, label: t("auth.stat.channels.lbl"), value: t("auth.stat.channels.val") },
    { icon: BarChart3, label: t("auth.stat.reports.lbl"), value: t("auth.stat.reports.val") },
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: fullName.trim() || email.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success(t("auth.signup_success"));
          navigate("/onboarding", { replace: true });
        } else {
          toast.success(t("auth.signup_verify"));
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        toast.success(t("auth.welcome"));
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Panel izquierdo: branding S360T ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden auth-panel-left">
        <div className="absolute inset-0 s-grid-texture pointer-events-none opacity-50" />
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full pointer-events-none auth-glow-blue" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full pointer-events-none auth-glow-green" />
        <div className="absolute -bottom-20 -right-20 opacity-[0.04] pointer-events-none">
          <GearMark size={420} />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Back link + logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GearMark size={34} />
              <div>
                <div className="auth-lockup-title">
                  ElyonPOS<span className="c-blue">360</span><span className="c-green">T</span>
                </div>
                <div className="auth-lockup-sub">Open Source POS</div>
              </div>
            </div>
            <Link to="/" className="auth-back-link">
              <ArrowLeft className="h-3.5 w-3.5" /> {t("auth.back")}
            </Link>
          </div>

          {/* Status pill */}
          <div className="mt-6 self-start">
            <span className="s-pill s-pill-green inline-flex items-center gap-2">
              <LiveDot /> {t("auth.system.status")}
            </span>
          </div>

          {/* Hero copy */}
          <div className="mt-auto mb-auto pt-12">
            <h1 className="auth-hero-title">
              {t("auth.hero.title1")}<br />
              <span className="gradient-text">{t("auth.hero.title2")}</span>
            </h1>
            <p className="auth-hero-sub">
              {t("auth.hero.sub")}
            </p>

            {/* Features */}
            <div className="mt-8 space-y-3.5">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="auth-feature-icon">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-sidebar-foreground/70 leading-snug">{text}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 pt-8 border-t border-sidebar-border/30 grid grid-cols-3 gap-4">
              {PROOF.map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="h-4 w-4 text-primary/60 mx-auto mb-1" />
                  <div className="text-base font-black text-sidebar-foreground">{value}</div>
                  <div className="text-[10px] text-sidebar-foreground/40 leading-snug mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-sidebar-foreground/25 tracking-wider">
            © 2026 ElyonPOS360T Contributors · Apache 2.0
          </div>
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 overflow-y-auto relative">
        
        {/* Controls in top-right area */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMode}
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-card/60 hover:bg-muted text-foreground transition-all duration-200 cursor-pointer shadow-sm active:scale-95 shrink-0"
            title={mode === "dark" ? t("topbar.theme_light") : t("topbar.theme_dark")}
            aria-label={t("topbar.toggle_theme")}
          >
            {mode === "dark" ? (
              <Sun size={18} className="text-amber-400 animate-in fade-in zoom-in duration-300" />
            ) : (
              <Moon size={18} className="text-slate-600 dark:text-slate-300 animate-in fade-in zoom-in duration-300" />
            )}
          </button>
          <LanguageSelector className="w-32 sm:w-36" />
        </div>

        <div className="w-full max-w-sm space-y-5 mx-auto">

          {/* Mobile brand + back link */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <GearMark size={28} />
              <div className="auth-lockup-title">
                ElyonPOS<span className="c-blue">360</span><span className="c-green">T</span>
              </div>
            </div>
            <Link to="/" className="auth-back-link">
              <ArrowLeft className="h-3.5 w-3.5" /> {t("auth.start")}
            </Link>
          </div>

          {/* Form card */}
          <div className="glass p-7 rounded-3xl">
            <div className="flex bg-muted/60 p-1 rounded-xl mb-6 border border-border/40">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-center",
                  !isSignUp
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t("auth.tab.signin")}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-center",
                  isSignUp
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t("auth.tab.signup")}
              </button>
            </div>

            <div className="mb-5">
              <div className="h-label g-auth-eyebrow mb-1">
                {isSignUp ? t("auth.eyebrow.signup") : t("auth.eyebrow")}
              </div>
              <div className="h-display g-auth-title text-xl">
                {isSignUp ? t("auth.title.signup") : t("auth.title")}
              </div>
              <div className="h-meta mt-1 text-xs">
                {isSignUp ? t("auth.subtitle.signup") : t("auth.subtitle")}
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullname" className="text-sm font-medium">{t("auth.fullname")}</Label>
                  <Input
                    id="fullname"
                    type="text"
                    required
                    className="h-11 text-base"
                    placeholder={t("auth.fullname.ph")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</Label>
                <Input
                  id="email" type="email" required
                  inputMode="email" autoComplete="email"
                  className="h-11 text-base"
                  placeholder={t("auth.email.ph")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pwd" className="text-sm font-medium">{t("auth.password")}</Label>
                <Input
                  id="pwd" type="password" required minLength={6}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="h-11 text-base"
                  placeholder={isSignUp ? t("auth.password.ph.signup") : t("auth.password.ph")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="g-btn g-btn-primary g-btn-touch g-auth-submit w-full mt-2"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("auth.verifying")}</>
                  : isSignUp ? t("auth.submit.signup") : t("auth.submit")
                }
              </button>
            </form>
          </div>

          {/* Mini proof */}
          <div className="grid grid-cols-3 gap-3 lg:hidden">
            {PROOF.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass-thin rounded-2xl p-3 text-center">
                <Icon className="h-3.5 w-3.5 mx-auto mb-1 g-auth-proof-icon" />
                <div className="g-auth-proof-val leading-tight">{value}</div>
                <div className="h-meta g-auth-proof-lbl leading-tight mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground/50 text-center">
            {t("auth.restricted")}
          </p>
        </div>
      </div>
    </div>
  );
}
