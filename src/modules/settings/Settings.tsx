import { useState } from "react";
import BusinessSettings from "./BusinessSettings";
import BranchesSettings from "./BranchesSettings";
import UsersSettings from "./UsersSettings";
import TablesSettings from "./TablesSettings";
import SalesChannelsSettings from "./SalesChannelsSettings";
import ReceiptSettings from "./ReceiptSettings";
import AppearanceSettings from "./AppearanceSettings";
import WhatsAppSettings from "./WhatsAppSettings";
import AiAgentSettings from "./AiAgentSettings";
import { DataManagement } from "./DataManagement";
import { SystemMaintenance } from "./SystemMaintenance";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Building2, GitBranch, UtensilsCrossed, Users, Globe,
  MessageCircle, Bot, Receipt, Palette, Database, Wrench,
  ChevronRight,
} from "lucide-react";

type TabId = "business" | "branches" | "tables" | "users" | "canales" | "whatsapp" | "agente" | "receipt" | "apariencia" | "datos" | "ops";

export default function Settings() {
  const [active, setActive] = useState<TabId>("business");
  const { t } = useLanguage();

  const TABS = [
    { id: "business",   label: t("settings.tab.business"),   icon: Building2 },
    { id: "branches",   label: t("settings.tab.branches"),   icon: GitBranch },
    { id: "tables",     label: t("settings.tab.tables"),     icon: UtensilsCrossed },
    { id: "users",      label: t("settings.tab.users"),      icon: Users },
    { id: "canales",    label: t("settings.tab.channels"),   icon: Globe },
    { id: "whatsapp",   label: t("settings.tab.whatsapp"),   icon: MessageCircle },
    { id: "agente",     label: t("settings.tab.agent"),      icon: Bot },
    { id: "receipt",    label: t("settings.tab.receipt"),    icon: Receipt },
    { id: "apariencia", label: t("settings.tab.appearance"), icon: Palette },
    { id: "datos",      label: t("settings.tab.data"),       icon: Database },
    { id: "ops",        label: t("settings.tab.ops"),        icon: Wrench },
  ] as const;

  return (
    <div className="g-cfg-stage">
      {/* Left nav */}
      <div className="glass g-cfg-nav-panel">
        <div className="h-display g-cfg-nav-title">{t("settings.title")}</div>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={cn("g-cfg-nav-item", isActive && "is-active")}
              onClick={() => setActive(tab.id as TabId)}
            >
              <Icon size={15} />
              <span className="flex-1 text-left">{tab.label}</span>
              {isActive && <ChevronRight size={12} />}
            </button>
          );
        })}
        <div className="g-cfg-nav-hint glass-thin">
          {t("settings.hint")}
        </div>
      </div>

      {/* Content */}
      <div className="g-cfg-content">
        {active === "business"   && <BusinessSettings />}
        {active === "branches"   && <BranchesSettings />}
        {active === "tables"     && <TablesSettings />}
        {active === "users"      && <UsersSettings />}
        {active === "canales"    && <SalesChannelsSettings />}
        {active === "whatsapp"   && <WhatsAppSettings />}
        {active === "agente"     && <AiAgentSettings />}
        {active === "receipt"    && <ReceiptSettings />}
        {active === "apariencia" && <AppearanceSettings />}
        {active === "datos"      && <DataManagement />}
        {active === "ops"        && <SystemMaintenance />}
      </div>
    </div>
  );
}
