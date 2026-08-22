import type { Language } from "./translations";

export interface ErrorFormatOptions {
  language?: Language;
  products?: Array<{ id: string; name: string }>;
}

/**
 * Translates and normalizes database, network, and RPC error messages
 * into English or the active user language (English / Swahili / Spanish).
 */
export function formatErrorMessage(error: any, options: ErrorFormatOptions = {}): string {
  if (!error) return "An unexpected error occurred.";

  let raw = typeof error === "string" ? error : error?.message || String(error);
  const lang: Language = options.language || "en";

  // Check for insufficient stock error
  if (/stock insuficiente|insufficient stock/i.test(raw)) {
    const match = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    const prodId = match ? match[0] : null;
    const prod = prodId && options.products ? options.products.find((p) => p.id === prodId) : null;
    const prodName = prod ? prod.name : "";

    if (lang === "sw") {
      return prodName
        ? `Stoki haitoshi kwa "${prodName}". Tafadhali ongeza stoki kwenye Hifadhi kabla ya kuuza.`
        : `Stoki haitoshi kukamilisha mauzo. Tafadhali ongeza stoki kwenye Hifadhi.`;
    }
    if (lang === "es") {
      return prodName
        ? `Stock insuficiente para "${prodName}". Por favor ingresa inventario antes de vender.`
        : `Stock insuficiente para completar la venta.`;
    }
    return prodName
      ? `Insufficient stock for "${prodName}". Please add stock in Inventory before selling.`
      : `Insufficient stock to complete the sale. Please add stock in Inventory.`;
  }

  // Common database exception mappings
  const map: Array<{ regex: RegExp; en: string; sw: string; es: string }> = [
    {
      regex: /la venta no tiene items|no items in sale/i,
      en: "The sale has no items. Please add products to the ticket.",
      sw: "Bili haina bidhaa. Tafadhali ongeza bidhaa kabla ya kuuza.",
      es: "La venta no tiene productos. Agrega productos al ticket.",
    },
    {
      regex: /no hay caja abierta|abre caja antes de vender|open cash first/i,
      en: "Cash drawer is closed. Please open a cash register session before selling.",
      sw: "Keshia imefungwa. Tafadhali fungua keshia kabla ya kuuza.",
      es: "No hay caja abierta en esta sucursal. Abre caja antes de vender.",
    },
    {
      regex: /ya existe una caja abierta/i,
      en: "A cash register session is already open for this branch.",
      sw: "Keshia tayari imefunguliwa kwa tawi hili.",
      es: "Ya existe una caja abierta para esta sucursal.",
    },
    {
      regex: /la caja ya está cerrada/i,
      en: "The cash register session is already closed.",
      sw: "Keshia tayari imefungwa.",
      es: "La caja ya está cerrada.",
    },
    {
      regex: /cantidad inválida|invalid quantity/i,
      en: "Invalid quantity entered.",
      sw: "Kiasi kisicho sahihi.",
      es: "Cantidad inválida.",
    },
    {
      regex: /cupón inválido o vencido|invalid coupon/i,
      en: "Invalid or expired coupon code.",
      sw: "Kuponi si sahihi au imeisha muda.",
      es: "Cupón inválido o vencido.",
    },
    {
      regex: /los pagos.*no coinciden con el total/i,
      en: "Payment amount does not match the total.",
      sw: "Kiasi cha malipo hakilingani na jumla ya bili.",
      es: "Los pagos no coinciden con el total.",
    },
    {
      regex: /no inventory center found/i,
      en: "No active inventory warehouse found for this branch.",
      sw: "Hakuna hifadhi ya bidhaa iliyopatikana kwa tawi hili.",
      es: "No se encontró centro de inventario para esta sucursal.",
    },
    {
      regex: /centro de inventario inválido/i,
      en: "Invalid inventory center.",
      sw: "Hifadhi ya bidhaa si sahihi.",
      es: "Centro de inventario inválido.",
    },
    {
      regex: /el centro de origen y destino deben ser diferentes/i,
      en: "Origin and destination inventory centers must be different.",
      sw: "Hifadhi ya chanzo na mwisho lazima ziwe tofauti.",
      es: "El centro de origen y destino deben ser diferentes.",
    },
    {
      regex: /pin de supervisor requerido o inválido/i,
      en: "Supervisor PIN is required or invalid.",
      sw: "PIN ya msimamizi inahitajika au si sahihi.",
      es: "PIN de supervisor requerido o inválido.",
    },
    {
      regex: /selecciona al menos un item para devolver/i,
      en: "Please select at least one item to return.",
      sw: "Tafadhali chagua angalau bidhaa moja ya kurudisha.",
      es: "Selecciona al menos un item para devolver.",
    },
    {
      regex: /item de venta inválido/i,
      en: "Invalid sale item.",
      sw: "Kipengele cha mauzo si sahihi.",
      es: "Item de venta inválido.",
    },
    {
      regex: /venta no encontrada/i,
      en: "Sale record not found.",
      sw: "Mauzo hayakupatikana.",
      es: "Venta no encontrada.",
    },
    {
      regex: /la mesa no tiene items despachados/i,
      en: "The table has no dispatched items ready for checkout.",
      sw: "Meza haina vyakula vilivyotolewa kwa ajili ya malipo.",
      es: "La mesa no tiene items despachados para cobrar.",
    },
    {
      regex: /el pedido no tiene items vinculados/i,
      en: "The order has no items linked to the catalog.",
      sw: "Agizo halina bidhaa zilizounganishwa kwenye orodha.",
      es: "El pedido no tiene items vinculados al catálogo.",
    },
    {
      regex: /el nombre del negocio es requerido/i,
      en: "Business name is required.",
      sw: "Jina la biashara linahitajika.",
      es: "El nombre del negocio es requerido.",
    },
    {
      regex: /not authenticated|no autenticado/i,
      en: "Session expired. Please sign in again.",
      sw: "Kipindi kimeisha. Tafadhali ingia tena.",
      es: "Sesión expirada. Inicia sesión nuevamente.",
    },
    {
      regex: /forbidden|no autorizado/i,
      en: "You do not have permission to perform this action.",
      sw: "Huna ruhusa ya kufanya kitendo hiki.",
      es: "No tienes permisos para realizar esta acción.",
    },
    {
      regex: /error al guardar preferencia de vista/i,
      en: "Error saving view preference.",
      sw: "Hitilafu wakati wa kuhifadhi mwonekano.",
      es: "Error al guardar preferencia de vista.",
    },
    {
      regex: /error al guardar posición/i,
      en: "Error saving position.",
      sw: "Hitilafu wakati wa kuhifadhi nafasi.",
      es: "Error al guardar posición.",
    },
    {
      regex: /agrega al menos un producto|agrega productos/i,
      en: "Please add at least one product.",
      sw: "Tafadhali ongeza angalau bidhaa moja.",
      es: "Agrega al menos un producto.",
    },
    {
      regex: /no se pudo cargar el menú/i,
      en: "Could not load the menu.",
      sw: "Haikuweza kupakia menyu.",
      es: "No se pudo cargar el menú.",
    },
  ];

  for (const item of map) {
    if (item.regex.test(raw)) {
      return item[lang] || item.en;
    }
  }

  return raw;
}
