import { useState } from "react";
import type { DrugStock } from "../engines/syntheticData";
import { trendAdjustedDailyRate } from "../engines/forecastEngine";
import { IconClock } from "./icons";

/**
 * Live "what-if": scale the selected centre's daily consumption and watch its
 * days-to-stockout recompute. Display-only — never mutates the real stocks array,
 * so the demo baseline stays deterministic.
 */
export default function WhatIfControl({ stock }: { stock: DrugStock }) {
  const [mult, setMult] = useState(1);

  // Match the alert list exactly: days = currentUnits / trend-adjusted rate.
  const daysFromRate = (s: DrugStock) => Math.floor(s.currentUnits / trendAdjustedDailyRate(s));

  const baseDays = daysFromRate(stock);
  const scaled: DrugStock = {
    ...stock,
    dailyConsumptionAvg: stock.dailyConsumptionAvg * mult,
    consumptionHistory: stock.consumptionHistory.map((v) => v * mult),
  };
  const newDays = daysFromRate(scaled);
  const delta = newDays - baseDays;

  const tone =
    delta < 0
      ? { text: "text-red-600", chip: "bg-red-50 text-red-600 ring-red-200" }
      : delta > 0
        ? { text: "text-emerald-600", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
        : { text: "text-slate-700", chip: "bg-slate-100 text-slate-500 ring-slate-200" };

  const deltaLabel =
    delta === 0 ? "no change" : `${delta > 0 ? "+" : ""}${delta} day${Math.abs(delta) === 1 ? "" : "s"}`;

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <IconClock className="h-4 w-4 text-slate-400" />
        <h3 className="font-semibold text-slate-900">What-if: demand change</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Simulate a change in daily consumption of {stock.drugName}.
      </p>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold leading-none">
            <span className="text-slate-300 line-through mr-2 text-xl">
              {delta !== 0 ? `${baseDays}d` : ""}
            </span>
            <span className={tone.text}>{newDays}d</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">projected days to stockout</div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone.chip}`}
        >
          {deltaLabel}
        </span>
      </div>

      <input
        type="range"
        min={0.5}
        max={2}
        step={0.05}
        value={mult}
        onChange={(e) => setMult(Number(e.target.value))}
        className="mt-4 w-full accent-indigo-600"
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>50%</span>
        <span className="font-medium text-slate-600">{Math.round(mult * 100)}% of demand</span>
        <span>200%</span>
      </div>
    </div>
  );
}
