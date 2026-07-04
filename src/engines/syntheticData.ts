export type CentreType = "PHC" | "CHC";

export interface Centre {
  id: string;
  name: string;
  type: CentreType;
  lat: number;
  lng: number;
}

export interface DrugStock {
  centreId: string;
  drugName: string;
  currentUnits: number;
  dailyConsumptionAvg: number;
  consumptionHistory: number[];
  batchExpiryDate: string;
  reorderLevel: number;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);

function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const CENTRES: Centre[] = [
  { id: "PHC-1", name: "PHC Aushapur", type: "PHC", lat: 17.452, lng: 78.68 },
  { id: "PHC-2", name: "PHC Pocharam", type: "PHC", lat: 17.478, lng: 78.71 },
  { id: "PHC-3", name: "PHC Ghatkesar", type: "PHC", lat: 17.446, lng: 78.68 },
  { id: "PHC-4", name: "PHC Korremula", type: "PHC", lat: 17.463, lng: 78.72 },
  { id: "PHC-5", name: "PHC Annojiguda", type: "PHC", lat: 17.428, lng: 78.66 },
  { id: "PHC-6", name: "PHC Edulabad", type: "PHC", lat: 17.489, lng: 78.74 },
  { id: "PHC-7", name: "PHC Narapally", type: "PHC", lat: 17.44, lng: 78.63 },
  { id: "CHC-1", name: "CHC Uppal", type: "CHC", lat: 17.405, lng: 78.559 },
  { id: "CHC-2", name: "CHC Keesara", type: "CHC", lat: 17.5, lng: 78.66 },
  { id: "CHC-3", name: "CHC Medipally", type: "CHC", lat: 17.42, lng: 78.61 },
];

export const DRUGS = [
  "Insulin",
  "ORS",
  "Paracetamol",
  "Amoxicillin",
  "Iron-Folic Acid",
  "Anti-Rabies Vaccine",
  "BP Tablets (Amlodipine)",
  "ARV Kit",
];

function makeHistory(base: number): number[] {
  const hist: number[] = [];
  for (let i = 0; i < 30; i++) {
    const noise = randInt(-Math.ceil(base * 0.3), Math.ceil(base * 0.3));
    hist.push(Math.max(0, base + noise));
  }
  return hist;
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function generateStocks(): DrugStock[] {
  const stocks: DrugStock[] = [];

  for (const centre of CENTRES) {
    for (const drug of DRUGS) {
      const base = randInt(3, 15);
      const history = makeHistory(base);
      const daily = Math.max(1, Math.round(avg(history)));
      let units = daily * randInt(20, 45);
      let expiry = daysFromNow(randInt(120, 400));

      stocks.push({
        centreId: centre.id,
        drugName: drug,
        currentUnits: units,
        dailyConsumptionAvg: daily,
        consumptionHistory: history,
        batchExpiryDate: expiry,
        reorderLevel: daily * 7,
      });
    }
  }

  plant(stocks, "PHC-7", "Insulin", { units: 16, daily: 4, expiryDays: 300 });
  plant(stocks, "CHC-3", "Insulin", { units: 260, daily: 3, expiryDays: 30 });
  plant(stocks, "PHC-3", "ORS", { units: 48, daily: 8, expiryDays: 200 });
  plant(stocks, "CHC-2", "ORS", { units: 400, daily: 6, expiryDays: 90 });

  return stocks;
}

function plant(
  stocks: DrugStock[],
  centreId: string,
  drugName: string,
  opts: { units: number; daily: number; expiryDays: number }
) {
  const s = stocks.find((x) => x.centreId === centreId && x.drugName === drugName);
  if (!s) return;
  s.currentUnits = opts.units;
  s.dailyConsumptionAvg = opts.daily;
  s.consumptionHistory = makeHistory(opts.daily);
  s.batchExpiryDate = daysFromNow(opts.expiryDays);
  s.reorderLevel = opts.daily * 7;
}