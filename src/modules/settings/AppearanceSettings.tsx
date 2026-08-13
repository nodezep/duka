import React from "react";
import { useThemeStore, type ThemeMode, type ThemeAccent, type ThemeSpacing } from "@/stores/theme";
import { Sun, Moon, Palette, LayoutGrid, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppearanceSettings() {
  const { mode, setMode, accent, setAccent, spacing, setSpacing } = useThemeStore();

  const modes: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "light", label: "Modo Claro", icon: <Sun className="h-5 w-5 text-amber-500" />, desc: "Luminoso y nítido para entornos iluminados" },
    { id: "dark", label: "Modo Oscuro", icon: <Moon className="h-5 w-5 text-blue-400" />, desc: "Alta visibilidad y menor fatiga visual en la oscuridad" },
  ];

  const accents: { id: ThemeAccent; label: string; bg: string; border: string }[] = [
    { id: "azul", label: "Azul S360T", bg: "bg-[#1E63E6]", border: "border-[#1E63E6]" },
    { id: "indigo", label: "Índigo Tech", bg: "bg-[#4F46E5]", border: "border-[#4F46E5]" },
    { id: "teal", label: "Teal Menta", bg: "bg-[#0D9488]", border: "border-[#0D9488]" },
  ];

  const spacings: { id: ThemeSpacing; label: string; desc: string }[] = [
    { id: "comodo", label: "Cómodo", desc: "Espaciado holgado e ideal para pantallas táctiles" },
    { id: "compacto", label: "Compacto", desc: "Mayor densidad de información para POS rápido" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-bold text-ink-900">Apariencia y Tema Visual</h3>
        <p className="text-sm text-ink-500 mt-1">
          Personaliza la experiencia visual del punto de venta según las condiciones de iluminación de tu negocio.
        </p>
      </div>

      {/* Mode selection */}
      <div className="glass p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Sun className="h-4 w-4 text-brand-500" /> Tema del Sistema
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
          <Palette className="h-4 w-4 text-brand-500" /> Color de Acento
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
          <LayoutGrid className="h-4 w-4 text-brand-500" /> Densidad de la Interfaz
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
          <Sparkles className="h-3.5 w-3.5 text-brand-500" /> Vista Previa en Vivo
        </div>
        <div className="glass-strong p-4 rounded-xl flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm text-ink-900">Terminal POS · Módulo Activo</div>
            <div className="h-meta text-xs">Modo {mode === "dark" ? "Oscuro" : "Claro"} activado · Glassmorphic UI</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="pill pill-ok">Online</span>
            <button type="button" className="g-btn g-btn-primary g-btn-sm">
              Ejemplo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
