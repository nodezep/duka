import { useState } from "react";
import { useTenantContext } from "@/hooks/useTenantContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ShieldCheck, RefreshCcw, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/useLanguage";

export function SystemMaintenance() {
  const { tenantId, branchId } = useTenantContext();
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const processEmailQueue = async () => {
    setLoading("email");
    try {
      const { data, error } = await supabase.functions.invoke("process-email-queue");
      if (error) throw error;
      toast.success(`${t("settings.ops.email_success")} ${data?.processed || 0}`);
    } catch (err: any) {
      toast.error(`${t("settings.ops.email_error")} ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const auditInventoryDrift = async () => {
    setLoading("inventory");
    try {
      const { error } = await supabase.rpc("audit_inventory_drift", {
        _tenant_id: tenantId,
        _branch_id: branchId
      });
      if (error) throw error;
      toast.success(t("settings.ops.stock_success"));
    } catch (err: any) {
      toast.error(`${t("settings.ops.stock_error")} ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const testWhatsAppConnection = async () => {
    setLoading("whatsapp");
    try {
      const { data, error } = await supabase.rpc("ai_whatsapp_config_summary", {
        _branch_id: branchId
      });
      if (error) throw error;
      
      const config = data?.[0];
      if (!config || !config.is_active) {
        toast.error(t("settings.ops.wa_inactive"));
        return;
      }

      toast.success(t("settings.ops.wa_success"));
    } catch (err: any) {
      toast.error(`${t("settings.ops.wa_error")} ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emails */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand-600">
            <Mail className="h-5 w-5" />
            <div className="g-title-15">{t("settings.ops.email_title")}</div>
          </div>
          <div className="h-meta">{t("settings.ops.email_desc")}</div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={processEmailQueue}
            disabled={!!loading}
          >
            {loading === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("settings.ops.email_btn")}
          </Button>
        </div>

        {/* Inventario */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand-600">
            <ShieldCheck className="h-5 w-5" />
            <div className="g-title-15">{t("settings.ops.stock_title")}</div>
          </div>
          <div className="h-meta">{t("settings.ops.stock_desc")}</div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={auditInventoryDrift}
            disabled={!!loading}
          >
            {loading === "inventory" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            {t("settings.ops.stock_btn")}
          </Button>
        </div>

        {/* WhatsApp */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand-600">
            <RefreshCcw className="h-5 w-5" />
            <div className="g-title-15">{t("settings.ops.wa_title")}</div>
          </div>
          <div className="h-meta">{t("settings.ops.wa_desc")}</div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={testWhatsAppConnection}
            disabled={!!loading}
          >
            {loading === "whatsapp" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {t("settings.ops.wa_btn")}
          </Button>
        </div>
      </div>

      <Alert variant="destructive" className="bg-destructive/5">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("settings.ops.manual_mode_title")}</AlertTitle>
        <AlertDescription>
          {t("settings.ops.manual_mode_desc")}
        </AlertDescription>
      </Alert>
    </div>
  );
}
