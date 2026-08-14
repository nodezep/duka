import { X, Sun, Moon, Palette, LogOut, Globe } from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { useTenantContext } from "@/hooks/useTenantContext";
import { signOutFully } from "@/lib/signOut";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/translations";

interface TweaksPanelProps {
  onClose: () => void;
}

export function TweaksPanel({ onClose }: TweaksPanelProps) {
  const { mode, setMode, accent, setAccent } = useThemeStore();
  const { language, setLanguage, t } = useLanguage();
  const { roles, branchId, branches } = useTenantContext();
  const navigate = useNavigate();

  const branchName = branches.find((b) => b.id === branchId)?.name ?? "—";
  const roleTranslated = roles[0] ? (t(`role.${roles[0]}` as any) || roles[0]) : t("role.user");
  const initials = (roles[0] ?? "U").slice(0, 2).toUpperCase();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "sw", label: t("lang.sw"), flag: "🇹🇿" },
    { code: "en", label: t("lang.en"), flag: "🇬🇧" },
    { code: "es", label: t("lang.es"), flag: "🇪🇸" },
  ];

  return (
    <div className="w-80 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" /> {t("tweaks.title")}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("tweaks.close")}
          title={t("tweaks.close")}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* User Info Card */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 border border-border/50">
        <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-foreground truncate">{branchName}</div>
          <div className="text-[11px] text-muted-foreground truncate">{roleTranslated}</div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground">{t("tweaks.mode")}</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("light")}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer",
              mode === "light"
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                : "border-border hover:bg-muted text-foreground"
            )}
          >
            <Sun className="h-3.5 w-3.5" /> {t("tweaks.light")}
          </button>
          <button
            type="button"
            onClick={() => setMode("dark")}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer",
              mode === "dark"
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                : "border-border hover:bg-muted text-foreground"
            )}
          >
            <Moon className="h-3.5 w-3.5" /> {t("tweaks.dark")}
          </button>
        </div>
      </div>

      {/* Accent selection */}
      <div className="space-y-1.5 pt-1 border-t border-border">
        <span className="text-xs font-semibold text-muted-foreground">{t("tweaks.accent")}</span>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "azul", label: t("tweaks.accent.azul"), bg: "bg-[#1E63E6]" },
            { id: "indigo", label: t("tweaks.accent.indigo"), bg: "bg-[#4F46E5]" },
            { id: "teal", label: t("tweaks.accent.teal"), bg: "bg-[#0D9488]" },
          ].map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAccent(a.id as any)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs transition-all duration-200 cursor-pointer",
                accent === a.id
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border text-foreground hover:bg-muted"
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", a.bg)} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language Switcher */}
      <div className="space-y-1.5 pt-1 border-t border-border">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Globe className="h-3 w-3" /> {t("common.language")}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={cn(
                "flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border text-xs transition-all duration-200 cursor-pointer",
                language === l.code
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                  : "border-border text-foreground hover:bg-muted"
              )}
            >
              <span>{l.flag}</span>
              <span className="truncate">{l.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-2 border-t border-border">
        <button
          type="button"
          onClick={async () => {
            onClose();
            await signOutFully();
            navigate("/auth");
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground active:scale-[0.98] transition-all duration-200 text-xs font-semibold cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t("user.logout")}
        </button>
      </div>
    </div>
  );
}
