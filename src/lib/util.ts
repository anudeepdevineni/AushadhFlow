import type { StockoutAlert } from "../engines/forecastEngine";

/** Stable identity for an alert (the engine's StockoutAlert has no id of its own). */
export const alertKey = (a: Pick<StockoutAlert, "centreId" | "drugName">) =>
  `${a.centreId}::${a.drugName}`;

/**
 * UI-layer illustrative pricing (₹ per unit). Purely synthetic — NOT part of the
 * engines. Used only to turn "units of expiring stock saved" into a headline
 * rupee figure for the waste-prevented metric. Unknown drugs fall back to a flat rate.
 */
export const PRICE_PER_UNIT: Record<string, number> = {
  Insulin: 45,
  ORS: 8,
  Paracetamol: 2,
  Amoxicillin: 6,
  Metformin: 3,
  Ciprofloxacin: 5,
  Azithromycin: 9,
  "Iron-Folic Acid": 1.5,
};

export const pricePerUnit = (drug: string): number => PRICE_PER_UNIT[drug] ?? 10;

/** Format a number as Indian rupees, no paise. */
export const inr = (n: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
