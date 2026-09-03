export const bookingKinds = ["shoot", "rental", "hold", "blocked"] as const;
export type BookingKind = (typeof bookingKinds)[number];

export const bookingStatuses = [
  "tentative",
  "confirmed",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const paymentStatuses = [
  "unpaid",
  "deposit",
  "paid",
  "refunded",
  "complimentary",
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const inquiryKinds = ["shoot", "rental"] as const;
export type InquiryKind = (typeof inquiryKinds)[number];

export const inquiryStatuses = ["new", "contacted", "booked", "archived"] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];

export const invoiceStatuses = ["draft", "sent", "paid", "void"] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];

export type CatalogAddon = {
  id: string;
  name: string;
  unitCents: number;
  unit: "session" | "hour" | "color";
};

export type ShootPackage = {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
};

export const shootPackages: ShootPackage[] = [
  { id: "maternity", name: "Maternity", priceCents: 65000, durationMinutes: 90 },
  { id: "newborn", name: "Newborn", priceCents: 75000, durationMinutes: 120 },
  { id: "branding", name: "Brand Studio", priceCents: 85000, durationMinutes: 120 },
  { id: "headshots", name: "Corporate / Headshots", priceCents: 45000, durationMinutes: 60 },
  { id: "family", name: "Family Session", priceCents: 55000, durationMinutes: 60 },
  { id: "seasonals", name: "Seasonals", priceCents: 35000, durationMinutes: 30 },
  { id: "celebrations", name: "Celebrations", priceCents: 60000, durationMinutes: 90 },
  { id: "podcasts", name: "Podcast Session", priceCents: 50000, durationMinutes: 90 },
];

export const rentalHourlyCents = 5500;
export const rentalMinimumHours = 2;
export const rentalDayDiscountHours = 8;
export const rentalDayDiscount = 0.2;
export const rentalDepositRate = 0.5;
export const rentalLeadMinutes = 120;
export const rentalHoldMinutes = 45;

export function depositCents(totalCents: number): number {
  return Math.round(totalCents * rentalDepositRate);
}

export const catalogAddons: CatalogAddon[] = [
  { id: "paper", name: "Paper roll backdrop", unitCents: 2500, unit: "color" },
  { id: "flashes", name: "Studio flashes", unitCents: 4000, unit: "session" },
  { id: "softboxes", name: "Softboxes & modifiers", unitCents: 3000, unit: "session" },
  { id: "assistant", name: "Studio assistant", unitCents: 4500, unit: "hour" },
];

export type AddonSelection = { id: string; qty: number };

export type QuoteLine = { label: string; cents: number };

export function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${(abs / 100).toFixed(2)}`;
}

export function kindLabel(kind: BookingKind): string {
  switch (kind) {
    case "shoot":
      return "In-house shoot";
    case "rental":
      return "Studio rental";
    case "hold":
      return "Hold";
    case "blocked":
      return "Blocked";
  }
}

export function quoteBooking(input: {
  kind: BookingKind;
  sessionType?: string | null;
  durationMinutes: number;
  addons: AddonSelection[];
}): { totalCents: number; lines: QuoteLine[] } {
  const lines: QuoteLine[] = [];
  const hours = input.durationMinutes / 60;

  if (input.kind === "shoot") {
    const pack = shootPackages.find((p) => p.id === input.sessionType);
    if (pack) {
      lines.push({ label: pack.name, cents: pack.priceCents });
    }
  } else if (input.kind === "rental") {
    let sub = Math.round(hours * rentalHourlyCents);
    lines.push({
      label: `Studio rental · ${hours.toFixed(hours % 1 === 0 ? 0 : 1)} hr`,
      cents: sub,
    });
    if (hours >= rentalDayDiscountHours) {
      const off = Math.round(sub * rentalDayDiscount);
      lines.push({ label: "8+ hour day (20% off)", cents: -off });
    }
  }

  for (const sel of input.addons) {
    if (sel.qty <= 0) continue;
    const addon = catalogAddons.find((a) => a.id === sel.id);
    if (!addon) continue;
    const qty = addon.unit === "hour" ? sel.qty : sel.qty;
    const cents = addon.unitCents * qty;
    const qtyLabel =
      addon.unit === "color"
        ? `${sel.qty} color${sel.qty === 1 ? "" : "s"}`
        : addon.unit === "hour"
          ? `${sel.qty} hr`
          : "session";
    lines.push({ label: `${addon.name} · ${qtyLabel}`, cents });
  }

  const totalCents = lines.reduce((sum, line) => sum + line.cents, 0);
  return { totalCents, lines };
}

export function defaultTitle(kind: BookingKind, sessionType?: string | null): string {
  if (kind === "shoot") {
    return shootPackages.find((p) => p.id === sessionType)?.name ?? "In-house shoot";
  }
  if (kind === "rental") return "Studio rental";
  if (kind === "hold") return "Hold";
  return "Blocked";
}
