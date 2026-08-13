import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { signOutFully } from "@/lib/signOut";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Building2, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenantStore } from "@/stores/tenant";
import { useQueryClient } from "@tanstack/react-query";
import { GearMark } from "@/components/shared/GearMark";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/shared/LanguageSelector";

export default function Onboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { setTenant, setBranch } = useTenantStore();
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t("onboarding.doc.title");
  }, [t]);

  const [checking, setChecking] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenantOptions, setTenantOptions] = useState<
    Array<{ tenant_id: string; branch_id: string | null; role: string; tenants: { name: string } | null }>
  >([]);

  const [businessName, setBusinessName] = useState("");
  const [branchName, setBranchName] = useState(() => t("onboarding.setup.branch_default"));
  const [taxRate, setTaxRate] = useState("19");

  const enterTenant = async (tenantId: string, branchId: string | null) => {
    setTenant(tenantId);
    if (branchId) setBranch(branchId);
    else {
      const { data: br } = await supabase
        .from("branches").select("id")
        .eq("tenant_id", tenantId).eq("status", "active")
        .order("name").limit(1).maybeSingle();
      setBranch(br?.id ?? null);
    }
    await qc.invalidateQueries({ queryKey: ["my-roles"] });
    navigate("/dashboard", { replace: true });
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: myRoles } = await supabase
          .from("user_roles")
          .select("tenant_id, branch_id, role, tenants(name)")
          .eq("user_id", user.id);

        if (myRoles && myRoles.length > 0) {
          if (myRoles.length === 1) {
            await enterTenant(myRoles[0].tenant_id, myRoles[0].branch_id);
            return;
          }
          setTenantOptions(myRoles as any);
          setChecking(false);
          return;
        }

        const { data: anyTenant } = await supabase
          .from("tenants").select("id").limit(1).maybeSingle();

        if (anyTenant) { setAccessDenied(true); }
        else { setNeedsBootstrap(true); }
      } catch { setNeedsBootstrap(true); }
      finally { setChecking(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("bootstrap_tenant" as any, {
        _business_name: businessName.trim(),
        _branch_name: branchName.trim(),
        _tax_rate: Number(taxRate) / 100,
      });
      if (error) throw error;
      const bootstrap = Array.isArray(data) ? data[0] : data;
      if (!bootstrap?.tenant_id || !bootstrap?.branch_id) {
        throw new Error(t("onboarding.setup.error"));
      }
      setTenant(bootstrap.tenant_id);
      setBranch(bootstrap.branch_id);
      await qc.invalidateQueries({ queryKey: ["my-roles"] });
      toast.success(t("onboarding.setup.success"));
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? t("onboarding.setup.error"));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="g-onboarding-root">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--ink-400)" }} />
      </div>
    );
  }

  if (tenantOptions.length > 0) {
    return (
      <div className="g-onboarding-root">
        <div className="glass g-onboarding-card">
          <div className="absolute top-4 right-4">
            <LanguageSelector />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <GearMark size={36} />
            <div>
              <div className="h-label g-auth-eyebrow mb-1">{t("onboarding.multi.eyebrow")}</div>
              <div className="h-display g-auth-title">{t("onboarding.multi.title")}</div>
              <div className="h-meta mt-0.5">{t("onboarding.multi.sub")}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {tenantOptions.map((opt) => (
              <button
                key={opt.tenant_id}
                type="button"
                className="glass-thin g-onboarding-tenant-btn text-left"
                onClick={() => enterTenant(opt.tenant_id, opt.branch_id)}
              >
                <div className="g-onboarding-tenant-name">
                  {opt.tenants?.name ?? opt.tenant_id}
                </div>
                <div className="h-meta capitalize">{t("onboarding.multi.role")}: {opt.role}</div>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="g-btn g-btn-ghost w-full mt-4"
            onClick={async () => { await signOutFully(); navigate("/auth", { replace: true }); }}
          >
            {t("user.signout")}
          </button>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="g-onboarding-root">
        <div className="glass g-onboarding-card text-center" style={{ position: "relative" }}>
          <div className="absolute top-4 right-4">
            <LanguageSelector />
          </div>
          <div className="orb g-onboarding-lock-orb mx-auto mb-4">
            <Lock size={26} />
          </div>
          <div className="h-label g-onboarding-denied-eyebrow mb-2">{t("onboarding.denied.eyebrow")}</div>
          <div className="h-display g-auth-title mb-2">{t("onboarding.denied.title")}</div>
          <p className="h-meta mb-6">{t("onboarding.denied.sub")}</p>
          <button
            type="button"
            className="g-btn g-btn-ghost w-full"
            onClick={async () => { await signOutFully(); navigate("/auth", { replace: true }); }}
          >
            {t("user.signout")}
          </button>
        </div>
      </div>
    );
  }

  if (!needsBootstrap) return null;

  return (
    <div className="g-onboarding-root">
      <div className="glass g-onboarding-card" style={{ position: "relative" }}>
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="orb g-onboarding-setup-orb">
            <Building2 size={20} />
          </div>
          <div>
            <div className="h-label g-auth-eyebrow mb-1">{t("onboarding.setup.eyebrow")}</div>
            <div className="h-display g-auth-title">{t("onboarding.setup.title")}</div>
            <div className="h-meta">{t("onboarding.setup.sub")}</div>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("onboarding.setup.business_name")}</Label>
            <Input required placeholder={t("onboarding.setup.business_placeholder")} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("onboarding.setup.branch_name")}</Label>
            <Input required value={branchName} onChange={(e) => setBranchName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("onboarding.setup.tax")}</Label>
            <Input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </div>
          <button type="submit" className="g-btn g-btn-primary g-btn-touch w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t("onboarding.setup.creating") : t("onboarding.setup.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
