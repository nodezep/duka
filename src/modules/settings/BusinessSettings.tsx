import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useDevMode } from "@/hooks/useDevMode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, FlaskConical, Layers, Percent, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const CURRENCIES = ["TZS", "KES", "UGX", "USD", "EUR", "COP", "MXN", "ARS", "PEN", "CLP", "BRL"];

export default function BusinessSettings() {
  const { tenantId, hasRole } = useTenantContext();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const canEdit = hasRole("owner", "admin");
  const { devMode, canToggle, setDevMode, isPending: devModePending } = useDevMode();
  const [applyingAll, setApplyingAll] = useState(false);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, currency, tax_rate, allow_negative_stock")
        .eq("id", tenantId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    name: "",
    currency: "TZS",
    tax_rate: 18,
    allow_negative_stock: false,
  });

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name ?? "",
        currency: tenant.currency ?? "TZS",
        tax_rate: Number(tenant.tax_rate ?? 0),
        allow_negative_stock: !!tenant.allow_negative_stock,
      });
    }
  }, [tenant]);

  const save = async () => {
    if (!tenantId) return;
    if (!form.name.trim()) return toast.error(t("settings.name_required"));
    const { error } = await supabase
      .from("tenants")
      .update({
        name: form.name.trim(),
        currency: form.currency,
        tax_rate: form.tax_rate,
        allow_negative_stock: form.allow_negative_stock,
      })
      .eq("id", tenantId);
    if (error) return toast.error(error.message);
    toast.success(t("settings.saved"));
    qc.invalidateQueries({ queryKey: ["tenant"] });
    qc.invalidateQueries({ queryKey: ["my-roles"] });
  };

  const applyTaxToAllProducts = async () => {
    if (!tenantId) return;
    setApplyingAll(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ tax_rate: form.tax_rate })
        .eq("tenant_id", tenantId);
      if (error) throw error;
      toast.success(`${t("settings.biz.tax_applied_all") || "Tax updated on all products"} (${form.tax_rate}%)`);
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setApplyingAll(false);
    }
  };

  if (isLoading) return <div className="h-meta">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl max-w-2xl space-y-5">
        <div className="space-y-1.5">
          <Label>{t("settings.biz.name")}</Label>
          <Input
            placeholder={t("settings.biz.name_ph")}
            value={form.name}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t("settings.biz.currency")}</Label>
            <Select
              value={form.currency}
              disabled={!canEdit}
              onValueChange={(v) => setForm({ ...form, currency: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("settings.biz.tax")} (%)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                disabled={!canEdit}
                value={form.tax_rate}
                onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })}
              />
              {canEdit && (
                <button
                  type="button"
                  onClick={applyTaxToAllProducts}
                  disabled={applyingAll}
                  className="g-btn g-btn-outline whitespace-nowrap text-xs h-10 px-3"
                  title={t("settings.biz.apply_tax_all") || "Apply this tax rate to all products in catalog"}
                >
                  <Percent className="h-3.5 w-3.5 mr-1" />
                  {t("settings.biz.apply_all") || "Apply to all"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Allow negative stock toggle */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="orb orb-sq w-9 h-9">
                <Layers className="h-4 w-4 text-primary" />
              </span>
              <div className="space-y-0.5">
                <p className="font-semibold text-sm text-ink-900">{t("settings.biz.allow_negative_stock") || "Allow Sales Without Stock (Negative Stock)"}</p>
                <p className="h-meta max-w-sm">{t("settings.biz.allow_negative_stock_desc") || "Allow selling products in POS even if inventory has 0 stock."}</p>
              </div>
            </div>
            <Switch
              checked={form.allow_negative_stock}
              disabled={!canEdit}
              onCheckedChange={(checked) => setForm({ ...form, allow_negative_stock: checked })}
            />
          </div>
        </div>

        {canEdit ? (
          <div className="pt-2">
            <button type="button" className="g-btn g-btn-primary" onClick={save}>
              <Save className="h-4 w-4" /> {t("settings.save")}
            </button>
          </div>
        ) : (
          <p className="h-meta">{t("settings.biz.no_edit")}</p>
        )}
      </div>

      {canToggle && (
        <div className="glass p-6 rounded-2xl max-w-2xl border border-orange-200/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="orb orb-sq w-9 h-9">
                <FlaskConical className="h-4 w-4 text-orange-500" />
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-sm text-ink-900">{t("settings.dev_mode")}</p>
                <p className="h-meta max-w-sm">{t("settings.dev_mode_desc")}</p>
              </div>
            </div>
            <Switch
              checked={devMode}
              disabled={devModePending}
              onCheckedChange={(checked) => {
                setDevMode(checked);
                toast[checked ? "warning" : "success"](
                  checked ? t("settings.dev_mode_on") : t("settings.dev_mode_off")
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
