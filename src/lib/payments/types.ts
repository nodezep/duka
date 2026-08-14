export type MobileMoneyProvider = "mpesa" | "tigopesa" | "airtelmoney" | "halopesa";

export type BankProvider = "nmb" | "crdb" | "nbc" | "other_bank";

export type PaymentMethodType =
  | "cash"
  | "card"
  | "mpesa"
  | "tigopesa"
  | "airtelmoney"
  | "halopesa"
  | "bank"
  | "qr"
  | "transfer";

export interface MobileMoneyConfig {
  id: MobileMoneyProvider;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  prefixes: string[]; // Tanzanian mobile number prefixes
  ussdCode: string;
  iconLetter: string;
}

export const TANZANIA_MOBILE_PROVIDERS: Record<MobileMoneyProvider, MobileMoneyConfig> = {
  mpesa: {
    id: "mpesa",
    name: "Vodacom M-Pesa",
    shortName: "M-Pesa",
    color: "#E60000",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-500/30 hover:border-red-500",
    prefixes: ["074", "075", "076", "74", "75", "76", "25574", "25575", "25576"],
    ussdCode: "*150*00#",
    iconLetter: "M",
  },
  tigopesa: {
    id: "tigopesa",
    name: "Tigo Pesa / Mixx",
    shortName: "Tigo Pesa",
    color: "#00377B",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/30 hover:border-blue-500",
    prefixes: ["065", "067", "071", "65", "67", "71", "25565", "25567", "25571"],
    ussdCode: "*150*01#",
    iconLetter: "T",
  },
  airtelmoney: {
    id: "airtelmoney",
    name: "Airtel Money",
    shortName: "Airtel Money",
    color: "#FF0000",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-500/30 hover:border-rose-500",
    prefixes: ["068", "069", "078", "68", "69", "78", "25568", "25569", "25578"],
    ussdCode: "*150*60#",
    iconLetter: "A",
  },
  halopesa: {
    id: "halopesa",
    name: "HaloPesa",
    shortName: "HaloPesa",
    color: "#FF7900",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/30 hover:border-amber-500",
    prefixes: ["061", "062", "61", "62", "25561", "25562"],
    ussdCode: "*150*88#",
    iconLetter: "H",
  },
};

export const TANZANIA_BANKS: { id: BankProvider; name: string; shortName: string }[] = [
  { id: "nmb", name: "NMB Bank Plc", shortName: "NMB" },
  { id: "crdb", name: "CRDB Bank Plc", shortName: "CRDB" },
  { id: "nbc", name: "National Bank of Commerce", shortName: "NBC" },
  { id: "other_bank", name: "Benki Nyingine (Other Bank)", shortName: "Benki" },
];

/**
 * Automatically detects the Tanzanian telecom provider based on the phone number prefix
 */
export function detectProviderFromPhone(phone: string): MobileMoneyProvider | null {
  const clean = phone.replace(/\D/g, "");
  if (!clean) return null;

  for (const [providerId, config] of Object.entries(TANZANIA_MOBILE_PROVIDERS)) {
    for (const prefix of config.prefixes) {
      if (clean.startsWith(prefix)) {
        return providerId as MobileMoneyProvider;
      }
    }
  }
  return null;
}

export interface PaymentInitiationRequest {
  tenantId: string;
  amount: number;
  currency: string;
  method: PaymentMethodType;
  phoneNumber?: string;
  referenceNumber?: string;
  orderId?: string;
  customerName?: string;
  description?: string;
}

export interface PaymentInitiationResult {
  success: boolean;
  transactionId: string;
  status: "completed" | "pending" | "failed";
  providerMessage: string;
  ussdSent?: boolean;
}
