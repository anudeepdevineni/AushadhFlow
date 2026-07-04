import type { StockoutAlert } from "../engines/forecastEngine";
import type { Centre } from "../engines/syntheticData";
import { alertKey } from "../lib/util";
import { IconBell } from "./icons";

type Props = {
  alerts: StockoutAlert[];
  centresById: Map<string, Centre>;
  selectedKey: string | null;
  onSelect: (a: StockoutAlert) => void;
};

export default function AlertPanel({ alerts, centresById, selectedKey, onSelect }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <IconBell className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900">Stockout alerts</h2>
          <p className="text-xs text-slate-500">Most urgent first</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
          {alerts.length}
        </span>
      </div>

      <ul className="divide-y divide-slate-100">
        {alerts.map((a) => {
          const key = alertKey(a);
          const centre = centresById.get(a.centreId);
          const critical = a.severity === "critical";
          const selected = key === selectedKey;
          return (
            <li key={key} className="relative">
              {/* severity accent bar */}
              <span
                className={`absolute inset-y-0 left-0 w-1 ${critical ? "bg-red-500" : "bg-amber-400"}`}
              />
              <button
                type="button"
                onClick={() => onSelect(a)}
                className={`flex w-full items-center justify-between gap-3 py-3.5 pl-5 pr-4 text-left transition ${
                  selected ? "bg-indigo-50/60" : "hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                        critical ? "bg-red-500 af-blink" : "bg-amber-400"
                      }`}
                    />
                    <span className="truncate font-semibold text-slate-900">
                      {centre?.name ?? a.centreId}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {a.drugName}
                    </span>
                    <span
                      className={`text-[11px] font-medium uppercase tracking-wide ${
                        critical ? "text-red-500" : "text-amber-500"
                      }`}
                    >
                      {a.severity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-2xl font-bold leading-none ${
                      critical ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {Math.round(a.daysToStockout)}
                    <span className="text-base font-semibold">d</span>
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">left</div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
