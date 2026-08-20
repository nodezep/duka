import React, { createContext, useState, useEffect } from "react";
import { translations, type Language, type TranslationKeys } from "@/lib/translations";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys | (string & {})) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language");
    if (saved === "es" || saved === "en" || saved === "sw") return saved;
    const browserLang = typeof navigator !== "undefined" ? navigator.language?.slice(0, 2) : "en";
    if (browserLang === "es") return "es";
    if (browserLang === "sw") return "sw";
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
    // Apply lang attribute to HTML tag
    document.documentElement.setAttribute("lang", lang);
  };

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const t = (key: TranslationKeys | (string & {})): string => {
    const dict = translations[language] || translations.en || translations.es;
    return (dict as any)[key] || (translations.en as any)?.[key] || (translations.es as any)?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
