import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { type Language } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className, collapsed = false }: { className?: string; collapsed?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "es", label: t("lang.es"), flag: "🇪🇸" },
    { code: "en", label: t("lang.en"), flag: "🇬🇧" },
    { code: "sw", label: t("lang.sw"), flag: "🇰🇪" }
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (collapsed) {
    return (
      <div ref={dropdownRef} className={cn("relative flex items-center justify-center", className)}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border hover:bg-muted transition-all duration-300 text-foreground"
          title={t("common.language")}
        >
          <span className="text-sm font-semibold">{currentLang.flag}</span>
        </button>

        {open && (
          <div className="absolute left-12 top-0 z-50 w-36 rounded-xl border border-border bg-popover p-1 shadow-2xl animate-in fade-in slide-in-from-left-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-all duration-200",
                  language === lang.code
                    ? "bg-[#BF7B1E] text-white font-medium"
                    : "text-foreground/85 hover:bg-muted"
                )}
              >
                <span>{lang.flag} {lang.label}</span>
                {language === lang.code && <Check size={12} />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl bg-background/80 backdrop-blur-md border border-border px-4 py-2.5 text-sm hover:bg-muted active:scale-[0.98] transition-all duration-300 text-foreground shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <Globe size={15} className="text-muted-foreground animate-pulse" />
          <span className="font-semibold">{currentLang.flag} {currentLang.label}</span>
        </div>
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-full rounded-2xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/10 animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm transition-all duration-200",
                language === lang.code
                  ? "bg-[#BF7B1E] text-white font-medium"
                  : "text-foreground/80 hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {language === lang.code && <Check size={14} className="stroke-[2.5]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
