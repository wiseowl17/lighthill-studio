import { shootPackages, type BookingKind } from "./catalog";

export const colorSwatchIds = [
  "ink",
  "clay",
  "wine",
  "forest",
  "gold",
  "slate",
  "ocean",
  "sand",
  "rose",
  "moss",
] as const;

export type ColorSwatchId = (typeof colorSwatchIds)[number];

export const colorSwatches: Array<{ id: ColorSwatchId; label: string }> = [
  { id: "ink", label: "Ink" },
  { id: "clay", label: "Clay" },
  { id: "wine", label: "Wine" },
  { id: "forest", label: "Forest" },
  { id: "gold", label: "Gold" },
  { id: "slate", label: "Slate" },
  { id: "ocean", label: "Ocean" },
  { id: "sand", label: "Sand" },
  { id: "rose", label: "Rose" },
  { id: "moss", label: "Moss" },
];

export type FloorCategory = {
  id: string;
  label: string;
};

export const floorCategories: FloorCategory[] = [
  ...shootPackages.map((pack) => ({ id: pack.id, label: pack.name })),
  { id: "rental", label: "Studio rental" },
  { id: "hold", label: "Hold" },
  { id: "blocked", label: "Blocked" },
];

export const defaultCategoryColors: Record<string, ColorSwatchId> = {
  maternity: "rose",
  newborn: "sand",
  branding: "ink",
  headshots: "slate",
  family: "forest",
  seasonals: "gold",
  celebrations: "wine",
  podcasts: "ocean",
  rental: "clay",
  hold: "moss",
  blocked: "ink",
};

export function isSwatchId(value: string): value is ColorSwatchId {
  return (colorSwatchIds as readonly string[]).includes(value);
}

export function mergeCategoryColors(
  raw: unknown,
): Record<string, ColorSwatchId> {
  const parsed =
    typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  const extra =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  const next: Record<string, ColorSwatchId> = { ...defaultCategoryColors };
  for (const [key, value] of Object.entries(extra)) {
    if (typeof value === "string" && isSwatchId(value)) next[key] = value;
  }
  return next;
}

export function categoryKey(
  kind: BookingKind,
  sessionType?: string | null,
): string {
  if (kind === "shoot") {
    if (sessionType && shootPackages.some((pack) => pack.id === sessionType)) {
      return sessionType;
    }
    return "branding";
  }
  return kind;
}

export function swatchStyle(id: string): { backgroundColor: string; color: string } {
  const key = isSwatchId(id) ? id : "ink";
  return {
    backgroundColor: `var(--color-swatch-${key})`,
    color: `var(--color-swatch-${key}-fg)`,
  };
}
