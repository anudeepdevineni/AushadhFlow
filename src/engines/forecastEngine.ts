import type { DrugStock } from "./syntheticData";

export interface StockoutAlert {
  centreId: string;
  drugName: string;
  currentUnits: number;
  dailyConsumptionAvg: number;
  daysToStockout: number;
  severity: "critical" | "warning";
}

const RESUPPLY_LEAD_TIME_DAYS = 7;
const CRITICAL_THRESHOLD_DAYS = 5;

export function daysToStockout(stock: DrugStock): number {
  if (stock.dailyConsumptionAvg <= 0) return Infinity;
  return Math.floor(stock.currentUnits / stock.dailyConsumptionAvg);
}

export function trendAdjustedDailyRate(stock: DrugStock): number {
  const h = stock.consumptionHistory;
  if (!h || h.length === 0) return stock.dailyConsumptionAvg;
  const recent = h.slice(-7);
  const older = h.slice(0, -7);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg =
    older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
  return Math.max(1, recentAvg * 0.7 + olderAvg * 0.3);
}

export function getAlerts(stocks: DrugStock[]): StockoutAlert[] {
  const alerts: StockoutAlert[] = [];

  for (const stock of stocks) {
    const rate = trendAdjustedDailyRate(stock);
    const days = Math.floor(stock.currentUnits / rate);

    if (days < RESUPPLY_LEAD_TIME_DAYS) {
      alerts.push({
        centreId: stock.centreId,
        drugName: stock.drugName,
        currentUnits: stock.currentUnits,
        dailyConsumptionAvg: Math.round(rate),
        daysToStockout: days,
        severity: days <= CRITICAL_THRESHOLD_DAYS ? "critical" : "warning",
      });
    }
  }

  return alerts.sort((a, b) => a.daysToStockout - b.daysToStockout);
}