import type { Database } from "@/integrations/supabase/types";

export type SalesChannel = Database["public"]["Enums"]["sales_channel"];

export const CHANNELS: { id: SalesChannel; label: string; labelKey: string; short: string }[] = [
  { id: "pos", label: "In-Store / Counter", labelKey: "channel.pos", short: "POS" },
  { id: "tables", label: "Dine-In / Tables", labelKey: "channel.tables", short: "Tables" },
  { id: "rappi", label: "Rappi / Digital", labelKey: "channel.rappi", short: "Rappi" },
  { id: "whatsapp", label: "WhatsApp", labelKey: "channel.whatsapp", short: "WA" },
  { id: "didi", label: "DiDi Food", labelKey: "channel.didi", short: "DiDi" },
  { id: "uber", label: "Uber Eats", labelKey: "channel.uber", short: "Uber" },
  { id: "delivery", label: "Direct Delivery", labelKey: "channel.delivery", short: "Delivery" },
];

export const channelLabel = (c: SalesChannel, t?: (key: string) => string) => {
  if (t) {
    const translated = t(`channel.${c}`);
    if (translated && translated !== `channel.${c}`) return translated;
  }
  return CHANNELS.find((x) => x.id === c)?.label ?? c;
};

export type ChannelPriceRow = {
  product_id: string;
  branch_id: string | null;
  channel: SalesChannel;
  price: number;
};

export type BranchProductRow = {
  product_id: string;
  branch_id: string;
  is_available: boolean;
  local_price: number | null;
};

/**
 * Resolve final unit price for a product given branch + channel.
 * Priority:
 *   1. branch+channel specific price
 *   2. global channel price (branch_id NULL)
 *   3. branch local price override (branch_products.local_price)
 *   4. base product.price
 */
export function resolvePrice(
  productId: string,
  basePrice: number,
  branchId: string | null,
  channel: SalesChannel,
  channelPrices: ChannelPriceRow[],
  branchProducts: BranchProductRow[]
): number {
  if (branchId) {
    const branchChan = channelPrices.find(
      (p) => p.product_id === productId && p.branch_id === branchId && p.channel === channel
    );
    if (branchChan) return Number(branchChan.price);
  }
  const globalChan = channelPrices.find(
    (p) => p.product_id === productId && p.branch_id === null && p.channel === channel
  );
  if (globalChan) return Number(globalChan.price);

  if (branchId) {
    const bp = branchProducts.find((b) => b.product_id === productId && b.branch_id === branchId);
    if (bp?.local_price != null) return Number(bp.local_price);
  }
  return Number(basePrice);
}
