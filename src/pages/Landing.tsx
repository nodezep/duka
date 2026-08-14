import { Link, Navigate } from "react-router-dom";
import { GearMark } from "@/components/shared/GearMark";
import { LiveDot } from "@/components/shared/LiveDot";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { Loader2 } from "lucide-react";
import {
  ShoppingCart, UtensilsCrossed, BarChart3, Wifi, Zap, Shield,
  Bike, ChefHat, Smartphone, Package, CheckCircle, ArrowRight, Star,
} from "lucide-react";

export default function Landing() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const FEATURES = [
    {
      icon: ShoppingCart,
      sc: "sc-blue",
      title: t("landing.feat.pos.title"),
      desc: t("landing.feat.pos.desc"),
    },
    {
      icon: UtensilsCrossed,
      sc: "sc-green",
      title: t("landing.feat.tables.title"),
      desc: t("landing.feat.tables.desc"),
    },
    {
      icon: Bike,
      sc: "sc-purple",
      title: t("landing.feat.delivery.title"),
      desc: t("landing.feat.delivery.desc"),
    },
    {
      icon: Smartphone,
      sc: "sc-amber",
      title: t("landing.feat.digital.title"),
      desc: t("landing.feat.digital.desc"),
    },
    {
      icon: ChefHat,
      sc: "sc-cyan",
      title: t("landing.feat.kds.title"),
      desc: t("landing.feat.kds.desc"),
    },
    {
      icon: Package,
      sc: "sc-lime",
      title: t("landing.feat.stock.title"),
      desc: t("landing.feat.stock.desc"),
    },
    {
      icon: BarChart3,
      sc: "sc-rose",
      title: t("landing.feat.reports.title"),
      desc: t("landing.feat.reports.desc"),
    },
    {
      icon: Wifi,
      sc: "sc-slate",
      title: t("landing.feat.offline.title"),
      desc: t("landing.feat.offline.desc"),
    },
  ];

  const STATS = [
    { value: "5", unit: t("landing.stat.channels.unit"), label: t("landing.stat.channels.lbl") },
    { value: "∞", unit: t("landing.stat.branches.unit"), label: t("landing.stat.branches.lbl") },
    { value: "100%", unit: t("landing.stat.offline.unit"), label: t("landing.stat.offline.lbl") },
    { value: "8", unit: t("landing.stat.roles.unit"), label: t("landing.stat.roles.lbl") },
  ];

  const PLANS = [
    {
      name: t("landing.plans.starter.name"),
      price: t("landing.plans.starter.price"),
      sub: t("landing.plans.starter.sub"),
      features: [
        t("landing.plans.starter.f1"),
        t("landing.plans.starter.f2"),
        t("landing.plans.starter.f3"),
        t("landing.plans.starter.f4"),
      ],
      cta: t("landing.plans.starter.cta"),
      accent: false,
    },
    {
      name: t("landing.plans.pro.name"),
      price: t("landing.plans.pro.price"),
      sub: t("landing.plans.pro.sub"),
      features: [
        t("landing.plans.pro.f1"),
        t("landing.plans.pro.f2"),
        t("landing.plans.pro.f3"),
        t("landing.plans.pro.f4"),
        t("landing.plans.pro.f5"),
        t("landing.plans.pro.f6"),
        t("landing.plans.pro.f7"),
      ],
      cta: t("landing.plans.pro.cta"),
      accent: true,
    },
    {
      name: t("landing.plans.ent.name"),
      price: t("landing.plans.ent.price"),
      sub: t("landing.plans.ent.sub"),
      features: [
        t("landing.plans.ent.f1"),
        t("landing.plans.ent.f2"),
        t("landing.plans.ent.f3"),
        t("landing.plans.ent.f4"),
      ],
      cta: t("landing.plans.ent.cta"),
      accent: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Topbar ────────────────────────────────────────────── */}
      <header className="landing-topbar">
        <div className="landing-container flex items-center justify-between h-full">
          <div className="flex items-center gap-2.5">
            <GearMark size={28} />
            <span className="landing-logo-text">
              POS<span className="c-blue">360</span><span className="c-green">T</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">{t("landing.features")}</a>
            <a href="#planes" className="hover:text-foreground transition-colors">{t("landing.plans")}</a>
            <a href="#contacto" className="hover:text-foreground transition-colors">{t("landing.contact")}</a>
          </nav>
          <div className="flex items-center gap-3">
            {/* Responsive Language Selector */}
            <LanguageSelector className="w-28 sm:w-36" />
            <Link to="/auth" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">
              {t("landing.login")}
            </Link>
            <Link to="/auth" className="landing-btn-primary text-xs sm:text-sm">
              {t("landing.start_free")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="landing-hero">
        {/* Background glows */}
        <div className="landing-glow-blue" />
        <div className="landing-glow-green" />
        <div className="absolute inset-0 s-grid-texture opacity-40 pointer-events-none" />

        {/* Gear watermark */}
        <div className="absolute -bottom-20 -right-20 opacity-[0.04] pointer-events-none hidden lg:block">
          <GearMark size={480} />
        </div>

        <div className="landing-container relative z-10 text-center">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 s-pill s-pill-green mb-6">
            <LiveDot /> {t("landing.system_pos")}
          </div>

          {/* Headline */}
          <h1 className="landing-hero-title">
            {t("landing.hero.title1")}<br />
            <span className="gradient-text">{t("landing.hero.title2")}</span>
          </h1>

          <p className="landing-hero-sub">
            {t("landing.hero.sub")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link to="/auth" className="landing-btn-primary landing-btn-lg">
              {t("landing.hero.cta_free")} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="landing-btn-ghost landing-btn-lg">
              {t("landing.hero.cta_features")}
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> {t("landing.hero.proof.no_card")}</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> {t("landing.hero.proof.14_days")}</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> {t("landing.hero.proof.cancel")}</span>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="landing-stats-bar">
        <div className="landing-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border">
            {STATS.map(({ value, unit, label }) => (
              <div key={label} className="text-center px-6 py-4">
                <div className="landing-stat-value">{value} <span className="c-blue text-2xl">{unit}</span></div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="text-center mb-12">
            <div className="eyebrow eyebrow-blue mb-3">{t("landing.feat.eyebrow")}</div>
            <h2 className="landing-section-title">
              {t("landing.feat.title1")}<br />
              <span className="gradient-text">{t("landing.feat.title2")}</span>
            </h2>
            <p className="landing-section-sub">
              {t("landing.feat.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, sc, title, desc }) => (
              <div key={title} className="landing-feature-card">
                <div className={`landing-feature-icon ${sc} sc-icon-bg`}>
                  <Icon className="h-5 w-5 sc-icon-color" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-base mt-4 mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Highlight row ─────────────────────────────────────── */}
      <section className="landing-section landing-highlight">
        <div className="landing-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <div>
              <div className="eyebrow eyebrow-blue mb-3">{t("landing.high.eyebrow")}</div>
              <h2 className="landing-section-title mb-4">
                {t("landing.high.title1")}<br />
                <span className="gradient-text">{t("landing.high.title2")}</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t("landing.high.desc")}
              </p>
              <ul className="space-y-3">
                {[
                  { label: t("landing.high.l1"), sub: t("landing.high.l1.desc") },
                  { label: t("landing.high.l2"), sub: t("landing.high.l2.desc") },
                  { label: t("landing.high.l3"), sub: t("landing.high.l3.desc") },
                ].map(({ label, sub }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm">{label}</span>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="landing-btn-primary landing-btn-lg mt-8 inline-flex">
                {t("landing.high.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: mock screens */}
            <div className="relative">
              {/* Desktop card */}
              <div className="landing-mock-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <div className="flex-1 h-5 rounded bg-muted/60 mx-2" />
                </div>
                <div className="flex gap-3">
                  {/* Sidebar mock */}
                  <div className="w-16 space-y-1.5 shrink-0">
                    <div className="h-7 rounded-lg bg-muted/80" />
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-5 rounded bg-muted/${i === 0 ? "100" : "40"}`} />
                    ))}
                  </div>
                  {/* Content mock */}
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 rounded-xl bg-muted/60 border border-border" />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-8 rounded bg-muted/40" />
                      ))}
                    </div>
                    <div className="h-20 rounded-xl bg-primary/10 border border-primary/20" />
                  </div>
                </div>
              </div>

              {/* Mobile card floating */}
              <div className="landing-mock-mobile">
                <div className="space-y-2">
                  <div className="h-16 rounded-xl bg-primary/15 border border-primary/20" />
                  <div className="grid grid-cols-2 gap-1.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-14 rounded-lg border ${i === 2 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/50 border-border"}`} />
                    ))}
                  </div>
                  <div className="h-8 rounded-lg bg-primary/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Planes ────────────────────────────────────────────── */}
      <section id="planes" className="landing-section">
        <div className="landing-container">
          <div className="text-center mb-12">
            <div className="eyebrow eyebrow-blue mb-3">{t("landing.plans.eyebrow")}</div>
            <h2 className="landing-section-title">
              {t("landing.plans.title1")} <span className="gradient-text">{t("landing.plans.title2")}</span>
            </h2>
            <p className="landing-section-sub">{t("landing.plans.sub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map(({ name, price, sub, features, cta, accent }) => (
              <div key={name} className={`landing-plan-card ${accent ? "landing-plan-card-accent" : ""}`}>
                {accent && (
                  <div className="landing-plan-badge">
                    <Star className="h-3 w-3 fill-current" /> {t("landing.plans.popular")}
                  </div>
                )}
                <div className="mb-6">
                  <div className="eyebrow mb-2">{name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{price}</span>
                    <span className="text-sm text-muted-foreground">{sub}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={accent ? "landing-btn-primary w-full justify-center" : "landing-btn-ghost w-full justify-center"}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="landing-section landing-cta-section">
        <div className="landing-container text-center relative z-10">
          <div className="eyebrow mb-4">{t("landing.cta.eyebrow")}</div>
          <h2 className="landing-section-title mb-4">
            {t("landing.cta.title1")}<br />
            <span className="gradient-text">{t("landing.cta.title2")}</span>
          </h2>
          <p className="landing-section-sub mb-8">
            {t("landing.cta.sub")}
          </p>
          <Link to="/auth" className="landing-btn-primary landing-btn-lg">
            {t("landing.cta.cta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GearMark size={22} />
              <span className="font-semibold text-sm">
                ElyonPOS<span className="c-blue">360</span><span className="c-green">T</span>
              </span>
              <span className="text-muted-foreground text-xs">{t("landing.footer.sub")}</span>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 ElyonPOS360T Contributors · Apache 2.0</p>
            <Link to="/auth" className="text-sm font-semibold text-primary hover:underline">
              {t("landing.login")} →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
