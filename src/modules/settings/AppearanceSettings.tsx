import React from "react";
import { useThemeStore, type ThemeMode, type ThemeAccent, type ThemeSpacing } from "@/stores/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { type Language } from "@/lib/translations";
import { Sun, Moon, Palette, LayoutGrid, Check, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppearanceSettings() {
  const { mode, setMode, accent, setAccent, spacing, setSpacing } = useThemeStore();
  const { language, setLanguage, t } = useLanguage();

  const languages: { id: Language; label: string; flag: string; desc: string }[] = [
    { id: "en", label: "English", flag: "🇬🇧", desc: "System forms, receipts, and POS in English" },
    { id: "es", label: "Español", flag: "🇪🇸", desc: "Formularios, comprobantes y POS en español" },
    { id: "sw", label: "Kiswahili", flag: "🇹🇿", desc: "Fomu zote, risiti na POS kwa Kiswahili" },
  ];

  const modes: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "light", label: t("appearance.settings.light_mode"), icon: <Sun className="h-5 w-5 text-amber-500" />, desc: t("appearance.settings.light_desc") },
    { id: "dark", label: t("appearance.settings.dark_mode"), icon: <Moon className="h-5 w-5 text-blue-400" />, desc: t("appearance.settings.dark_desc") },
  ];

  const accents: { id: ThemeAccent; label: string; bg: string; border: string }[] = [
    { id: "azul", label: t("appearance.settings.accent_blue"), bg: "bg-[#1E63E6]", border: "border-[#1E63E6]" },
    { id: "indigo", label: t("appearance.settings.accent_indigo"), bg: "bg-[#4F46E5]", border: "border-[#4F46E5]" },
    { id: "teal", label: t("appearance.settings.accent_teal"), bg: "bg-[#0D9488]", border: "border-[#0D9488]" },
  ];

  const spacings: { id: ThemeSpacing; label: string; desc: string }[] = [
    { id: "comodo", label: t("appearance.settings.spacing_comfortable"), desc: t("appearance.settings.spacing_comfortable_desc") },
    { id: "compacto", label: t("appearance.settings.spacing_compact"), desc: t("appearance.settings.spacing_compact_desc") },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-bold text-ink-900">{t("appearance.settings.title")}</h3>
        <p className="text-sm text-ink-500 mt-1">
          {t("appearance.settings.desc")}
        </p>
      </div>

      {/* Language Selection */}
      <div className="glass p-5 rounded-2xl space-y-4 border-l-4 border-brand-500">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Globe className="h-4 w-4 text-brand-500" /> {t("appearance.settings.language")}
        </div>
        <p className="text-xs text-ink-500">{t("appearance.settings.language_desc")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {languages.map((l) => {
            const active = language === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id)}
                className={cn(
                  "glass-thin p-4 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between gap-2.5 relative overflow-hidden group cursor-pointer",
                  active
                    ? "border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10"
                    : "border-border hover:border-brand-500/40"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{l.flag}</span>
                    <span className="font-bold text-sm text-ink-900">{l.label}</span>
                  </div>
                  {active && (
                    <div className="h-5 w-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="h-meta text-[11px] leading-relaxed text-ink-500">{l.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode selection */}
      <div className="glass p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Sun className="h-4 w-4 text-brand-500" /> {t("appearance.settings.system_theme")}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {modes.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "glass-thin p-4 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between gap-3 relative overflow-hidden group",
                  active
                    ? "border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10"
                    : "border-border hover:border-brand-500/40"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl glass flex items-center justify-center transition-transform duration-200 group-hover:scale-110")}>
                      {m.icon}
                    </div>
                    <span className="font-bold text-sm text-ink-900">{m.label}</span>
                  </div>
                  {active && (
                    <div className="h-5 w-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="h-meta text-xs">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="glass p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Palette className="h-4 w-4 text-brand-500" /> {t("appearance.settings.accent_color")}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {accents.map((a) => {
            const active = accent === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccent(a.id)}
                className={cn(
                  "glass-thin p-3.5 rounded-xl text-left transition-all duration-200 border flex items-center justify-between gap-3",
                  active
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-border hover:border-brand-500/30"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn("h-4 w-4 rounded-full shrink-0 shadow-sm", a.bg)} />
                  <span className="text-xs font-semibold text-ink-900">{a.label}</span>
                </div>
                {active && <Check className="h-3.5 w-3.5 text-brand-500 shrink-0 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacing density */}
      <div className="glass p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <LayoutGrid className="h-4 w-4 text-brand-500" /> {t("appearance.settings.spacing")}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {spacings.map((s) => {
            const active = spacing === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSpacing(s.id)}
                className={cn(
                  "glass-thin p-3.5 rounded-xl text-left transition-all duration-200 border flex flex-col gap-1",
                  active
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-border hover:border-brand-500/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-900">{s.label}</span>
                  {active && <Check className="h-3.5 w-3.5 text-brand-500 stroke-[2.5]" />}
                </div>
                <span className="h-meta text-[11px]">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="glass p-5 rounded-2xl space-y-3 border-l-4 border-brand-500">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-500">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" /> {t("common.preview") || "Preview"}
        </div>
        <div className="glass-strong p-4 rounded-xl flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm text-ink-900">Terminal POS · ElyonPOS360T</div>
            <div className="h-meta text-xs">Glassmorphic UI</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="pill pill-ok">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
