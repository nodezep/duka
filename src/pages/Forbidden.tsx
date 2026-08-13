import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { GearMark } from "@/components/shared/GearMark";
import { useEffect } from "react";

export default function Forbidden() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t("forbidden.title");
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 gap-6">
      <GearMark size={40} />
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 grid place-items-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <div className="eyebrow eyebrow-muted mb-2">{t("forbidden.error")}</div>
          <h1 className="page-header-title">{t("forbidden.heading")}</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t("forbidden.desc")}</p>
        </div>
        <Button asChild className="w-full h-11">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> {t("forbidden.back")}</Link>
        </Button>
      </div>
    </div>
  );
}
