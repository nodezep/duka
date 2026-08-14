import { supabase } from "@/integrations/supabase/client";

export const formatCurrency = (n: number, currency = "TZS") => {
  const effectiveCurrency = (!currency || currency === "KES" || currency === "COP") ? "TZS" : currency;
  const num = n || 0;
  if (effectiveCurrency === "TZS") {
    const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);
    return `Tsh ${formatted}`;
  }
  return new Intl.NumberFormat("sw-TZ", { style: "currency", currency: effectiveCurrency, maximumFractionDigits: 0 }).format(num);
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const formatDate = (d: string | Date, locale = "sw-TZ") =>
  new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(d));

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
