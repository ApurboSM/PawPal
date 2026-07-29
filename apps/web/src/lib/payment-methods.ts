import bkashLogo from "../../../../assets/payments/bkash.png";
import nagadLogo from "../../../../assets/payments/nagad.png";
import rocketLogo from "../../../../assets/payments/rocket.png";
import upayLogo from "../../../../assets/payments/upay.png";
import type { PaymentMethod, PaymentPurpose, PaymentStatus } from "@pawpal/shared/schema";

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  /** One-liner shown on the gateway card. */
  tagline: string;
  logo?: string;
  /** Brand colour, used for the card glow and the selected ring. */
  accent: string;
  /** Soft background for the card face. */
  surface: string;
  /** The account the customer sends money to. */
  account: string;
  accountLabel: string;
  accountType?: string;
  /** Label for the field where the customer reports what they paid *from*. */
  senderLabel: string;
  senderPlaceholder: string;
  /** What the provider calls its reference number. */
  transactionLabel: string;
  transactionPlaceholder: string;
  steps: string[];
}

/**
 * ⚠️ REPLACE THESE WITH YOUR REAL RECEIVING ACCOUNTS BEFORE GOING LIVE.
 * These are placeholders — customers are told to send money to whatever is
 * printed here, so a stale number means money lands in the wrong place.
 */
export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "bkash",
    name: "bKash",
    tagline: "Send Money or Payment from your bKash app",
    logo: bkashLogo,
    accent: "#E2136E",
    surface: "linear-gradient(140deg, #fff1f6 0%, #ffe3ee 100%)",
    account: "01XXXXXXXXX",
    accountLabel: "bKash Merchant / Personal number",
    accountType: "Personal",
    senderLabel: "Your bKash number",
    senderPlaceholder: "01XXXXXXXXX",
    transactionLabel: "bKash TrxID",
    transactionPlaceholder: "e.g. 9F7A2B1C3D",
    steps: [
      "Open the bKash app and choose Send Money.",
      "Enter the number above and the amount you agreed.",
      "Copy the TrxID from the confirmation SMS.",
      "Fill in the form here so we can match your payment.",
    ],
  },
  {
    id: "rocket",
    name: "Rocket",
    tagline: "Dutch-Bangla Rocket wallet transfer",
    logo: rocketLogo,
    accent: "#8C3494",
    surface: "linear-gradient(140deg, #f8f0fb 0%, #efe0f6 100%)",
    account: "01XXXXXXXXX-X",
    accountLabel: "Rocket account number",
    accountType: "Personal",
    senderLabel: "Your Rocket number",
    senderPlaceholder: "01XXXXXXXXX-X",
    transactionLabel: "Rocket TxnID",
    transactionPlaceholder: "e.g. 4A1B2C3D5E",
    steps: [
      "Dial *322# or open the Rocket app and choose Send Money.",
      "Enter the account above and the amount you agreed.",
      "Copy the TxnID from the confirmation message.",
      "Fill in the form here so we can match your payment.",
    ],
  },
  {
    id: "nagad",
    name: "Nagad",
    tagline: "Send Money from your Nagad wallet",
    logo: nagadLogo,
    accent: "#F02C2F",
    surface: "linear-gradient(140deg, #fff2f1 0%, #ffe0de 100%)",
    account: "01XXXXXXXXX",
    accountLabel: "Nagad number",
    accountType: "Personal",
    senderLabel: "Your Nagad number",
    senderPlaceholder: "01XXXXXXXXX",
    transactionLabel: "Nagad TrxID",
    transactionPlaceholder: "e.g. 7C2D9E1F4A",
    steps: [
      "Open the Nagad app and choose Send Money.",
      "Enter the number above and the amount you agreed.",
      "Copy the TrxID from the confirmation message.",
      "Fill in the form here so we can match your payment.",
    ],
  },
  {
    id: "upay",
    name: "Upay",
    tagline: "UCB Upay wallet transfer",
    logo: upayLogo,
    accent: "#0F9D58",
    surface: "linear-gradient(140deg, #f0fbf5 0%, #dff5e8 100%)",
    account: "01XXXXXXXXX",
    accountLabel: "Upay number",
    accountType: "Personal",
    senderLabel: "Your Upay number",
    senderPlaceholder: "01XXXXXXXXX",
    transactionLabel: "Upay TrxID",
    transactionPlaceholder: "e.g. 2B8C4D6E1F",
    steps: [
      "Open the Upay app and choose Send Money.",
      "Enter the number above and the amount you agreed.",
      "Copy the TrxID from the confirmation message.",
      "Fill in the form here so we can match your payment.",
    ],
  },
  {
    id: "bank",
    name: "Bank Transfer",
    tagline: "BEFTN, RTGS or a direct branch deposit",
    accent: "#4A6FA5",
    surface: "linear-gradient(140deg, #f1f5fb 0%, #e2eaf6 100%)",
    account: "0000 0000 0000 0000",
    accountLabel: "PawPal account number",
    accountType: "Current account · Your Bank Ltd, Dhaka branch",
    senderLabel: "Your account number",
    senderPlaceholder: "Account you transferred from",
    transactionLabel: "Reference / slip number",
    transactionPlaceholder: "e.g. BEFTN-20260729-1183",
    steps: [
      "Transfer to the account above from your bank app or branch.",
      "Keep the deposit slip or the BEFTN reference.",
      "Enter that reference below with your bank and branch name.",
      "Upload a photo of the slip if you have one — it speeds up review.",
    ],
  },
];

export const findPaymentMethod = (id?: string | null): PaymentMethodConfig | undefined =>
  PAYMENT_METHODS.find((method) => method.id === id);

export const PAYMENT_PURPOSE_LABELS: Record<PaymentPurpose, string> = {
  pet_purchase: "Pet purchase",
  adoption_fee: "Adoption fee",
  appointment_fee: "Appointment fee",
  donation: "Donation",
  other: "Other",
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; description: string; className: string }
> = {
  pending: {
    label: "Pending review",
    description: "We are matching your transaction against our account statement.",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  verified: {
    label: "Verified",
    description: "We found your transaction. Nothing else is needed.",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Not matched",
    description: "We could not match this transaction. See the note below.",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export const formatAmount = (amount: string, currency = "BDT") =>
  `${currency === "BDT" ? "৳" : `${currency} `}${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(Number(amount)) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
