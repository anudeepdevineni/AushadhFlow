import type { Centre, DrugStock } from "./syntheticData";
import type { StockoutAlert } from "./forecastEngine";

export interface TransferSuggestion {
  fromCentreId: string;
  fromCentreName: string;
  toCentreId: string;
  toCentreName: string;
  drugName: string;
  transferUnits: number;
  distanceKm: number;
  sourceExpiresInDays: number;
  preventsWaste: boolean;
  reasoning: string;
  score: number;
}

export function distanceKm(a: Centre, b: Centre): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

function daysUntil(iso: string): number {
  const now = new Date();
  const then = new Date(iso);
  return Math.ceil((then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const DONOR_SAFE_DAYS = 21;

export function findBestTransfer(
  alert: StockoutAlert,
  stocks: DrugStock[],
  centres: Centre[]
): TransferSuggestion | null {
  const toCentre = centres.find((c) => c.id === alert.centreId);
  if (!toCentre) return null;

  const targetDays = 30;
  const needed = Math.max(
    0,
    alert.dailyConsumptionAvg * targetDays - alert.currentUnits
  );

  const candidates: TransferSuggestion[] = [];

  for (const stock of stocks) {
    if (stock.drugName !== alert.drugName) continue;
    if (stock.centreId === alert.centreId) continue;

    const fromCentre = centres.find((c) => c.id === stock.centreId);
    if (!fromCentre) continue;

    const donorSafeStock = stock.dailyConsumptionAvg * DONOR_SAFE_DAYS;
    const donatable = stock.currentUnits - donorSafeStock;
    if (donatable <= 0) continue;

    const transferUnits = Math.min(needed, donatable);
    if (transferUnits <= 0) continue;

    const dist = distanceKm(fromCentre, toCentre);
    const expiresIn = daysUntil(stock.batchExpiryDate);

    const donorDaysToConsumeSurplus = donatable / stock.dailyConsumptionAvg;
    const preventsWaste = expiresIn < donorDaysToConsumeSurplus;

    const coverage = Math.min(1, transferUnits / Math.max(1, needed));
    const expiryScore = expiresIn <= 60 ? (60 - expiresIn) / 60 : 0;
    const proximityScore = Math.max(0, 1 - dist / 40);

    const score =
      coverage * 0.4 + expiryScore * 0.35 + proximityScore * 0.25;

    const reasoning = buildReasoning({
      transferUnits,
      fromName: fromCentre.name,
      toName: toCentre.name,
      drug: alert.drugName,
      dist,
      expiresIn,
      preventsWaste,
      daysToStockout: alert.daysToStockout,
    });

    candidates.push({
      fromCentreId: fromCentre.id,
      fromCentreName: fromCentre.name,
      toCentreId: toCentre.id,
      toCentreName: toCentre.name,
      drugName: alert.drugName,
      transferUnits: Math.round(transferUnits),
      distanceKm: dist,
      sourceExpiresInDays: expiresIn,
      preventsWaste,
      reasoning,
      score: Math.round(score * 100) / 100,
    });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

function buildReasoning(p: {
  transferUnits: number;
  fromName: string;
  toName: string;
  drug: string;
  dist: number;
  expiresIn: number;
  preventsWaste: boolean;
  daysToStockout: number;
}): string {
  const parts: string[] = [];
  parts.push(
    `${p.toName} will stock out of ${p.drug} in ${p.daysToStockout} days.`
  );
  parts.push(
    `Transfer ${Math.round(p.transferUnits)} units from ${p.fromName} (${p.dist} km away).`
  );
  if (p.preventsWaste) {
    parts.push(
      `That stock expires in ${p.expiresIn} days and would otherwise be wasted — so this prevents a stockout AND prevents waste.`
    );
  } else {
    parts.push(`${p.fromName} has a healthy surplus to spare.`);
  }
  return parts.join(" ");
}