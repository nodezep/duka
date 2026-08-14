import { useNetworkStore } from "@/stores/network";
import { CloudOff, Cloud, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";

export function NetworkStatusBadge() {
  const { isOnline, pendingSyncCount } = useNetworkStore();
  const { t } = useLanguage();

  if (isOnline && pendingSyncCount === 0) {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm transition-all duration-300">
        <Cloud className="w-3.5 h-3.5 mr-1.5" />
        {t("network.online")}
      </Badge>
    );
  }

  if (isOnline && pendingSyncCount > 0) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 shadow-sm transition-all duration-300">
        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        {t("network.syncing")} {pendingSyncCount}...
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 shadow-sm transition-all duration-300 animate-pulse">
      <CloudOff className="w-3.5 h-3.5 mr-1.5" />
      {t("network.offline")} ({pendingSyncCount} {t("network.pending")})
    </Badge>
  );
}
