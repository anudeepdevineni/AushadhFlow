import { useMemo, useState } from "react";
import { CENTRES, generateStocks } from "./engines/syntheticData";
import type { Centre } from "./engines/syntheticData";
import { getAlerts } from "./engines/forecastEngine";
import { findBestTransfer } from "./engines/matchingEngine";
import AlertPanel from "./components/AlertPanel";
import TransferCard from "./components/TransferCard";
import MapView from "./components/MapView";
import WhatIfControl from "./components/WhatIfControl";
import DrugSparkline from "./components/DrugSparkline";
import { alertKey, inr, pricePerUnit } from "./lib/util";
import { IconCross, IconBell, IconAlertTriangle, IconLeaf, IconBox, IconMapPin } from "./components/icons";

export default function App() {
  // Deterministic synthetic data — generated ONCE and held for the session.
  const [stocks] = useState(() => generateStocks());
  const alerts = useMemo(() => getAlerts(stocks), [stocks]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const centresById = useMemo(() => {
    const m = new Map<string, Centre>();
    for (const c of CENTRES) m.set(c.id, c);
    return m;
  }, []);

  const selectedAlert = useMemo(
    () => alerts.find((a) => alertKey(a) === selectedKey) ?? null,
    [alerts, selectedKey]
  );

  const transfer = useMemo(
    () => (selectedAlert ? findBestTransfer(selectedAlert, stocks, CENTRES) : null),
    [selectedAlert, stocks]
  );

  const selectedStock = useMemo(
    () =>
      selectedAlert
        ? stocks.find(
            (s) => s.centreId === selectedAlert.centreId && s.drugName === selectedAlert.drugName
          ) ?? null
        : null,
    [selectedAlert, stocks]
  );

  const deficitCentreIds = useMemo(() => new Set(alerts.map((a) => a.centreId)), [alerts]);

  const center = useMemo<[number, number]>(() => {
    const lat = CENTRES.reduce((s, c) => s + c.lat, 0) / CENTRES.length;
    const lng = CENTRES.reduce((s, c) => s + c.lng, 0) / CENTRES.length;
    return [lat, lng];
  }, []);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const wasteUnits = transfer?.preventsWaste ? transfer.transferUnits : 0;
  const wasteValue = transfer?.preventsWaste
    ? transfer.transferUnits * pricePerUnit(transfer.drugName)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-sm">
              <IconCross className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">AushadhFlow</h1>
              <p className="text-xs text-slate-500">
                Drug stockout forecasting &amp; redistribution · rural Telangana
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pb-12">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 py-5 lg:grid-cols-4">
          <Metric
            icon={<IconBell className="h-5 w-5" />}
            iconCls="bg-indigo-50 text-indigo-600"
            label="Active alerts"
            value={String(alerts.length)}
          />
          <Metric
            icon={<IconAlertTriangle className="h-5 w-5" />}
            iconCls="bg-red-50 text-red-600"
            label="Critical"
            value={String(criticalCount)}
            valueCls="text-red-600"
          />
          <Metric
            icon={<IconLeaf className="h-5 w-5" />}
            iconCls="bg-emerald-50 text-emerald-600"
            label="Waste prevented"
            value={wasteValue ? inr(wasteValue) : "—"}
            valueCls={wasteValue ? "text-emerald-600" : "text-slate-300"}
          />
          <Metric
            icon={<IconBox className="h-5 w-5" />}
            iconCls="bg-sky-50 text-sky-600"
            label="Units saved from expiry"
            value={wasteUnits ? String(wasteUnits) : "—"}
            valueCls={wasteUnits ? "text-sky-600" : "text-slate-300"}
          />
        </div>

        <main className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="lg:col-span-1">
            <AlertPanel
              alerts={alerts}
              centresById={centresById}
              selectedKey={selectedKey}
              onSelect={(a) => setSelectedKey(alertKey(a))}
            />
          </section>

          <section className="space-y-4 lg:col-span-2">
            {selectedAlert ? (
              transfer ? (
                <TransferCard key={`transfer-${selectedKey}`} transfer={transfer} />
              ) : (
                <div className="rounded-xl border border-slate-200/70 bg-white p-4 text-sm text-slate-500 shadow-sm">
                  No viable transfer found for this alert.
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
                <IconMapPin className="h-6 w-6 text-slate-300" />
                Select an alert to see the suggested transfer and route.
              </div>
            )}

            {/* Map with legend overlay */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
              <div className="h-[440px] w-full">
                <MapView
                  centres={CENTRES}
                  deficitCentreIds={deficitCentreIds}
                  transfer={transfer}
                  center={center}
                />
              </div>
              <div className="pointer-events-none absolute right-3 top-3 z-[1000] rounded-lg bg-white/90 px-3 py-2 text-xs shadow ring-1 ring-slate-200 backdrop-blur">
                <LegendRow color="bg-red-500" label="Needs stock" />
                <LegendRow color="bg-indigo-600" label="Source" />
                <LegendRow color="bg-green-600" label="Healthy" />
              </div>
            </div>

            {selectedStock && (
              <div key={`panels-${selectedKey}`} className="af-rise grid grid-cols-1 gap-4 md:grid-cols-2">
                <WhatIfControl stock={selectedStock} />
                <DrugSparkline
                  drugName={selectedStock.drugName}
                  history={selectedStock.consumptionHistory}
                />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function Metric({
  icon,
  iconCls,
  label,
  value,
  valueCls = "text-slate-900",
}: {
  icon: React.ReactNode;
  iconCls: string;
  label: string;
  value: string;
  valueCls?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconCls}`}>{icon}</div>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      </div>
      <div className={`mt-3 text-2xl font-bold ${valueCls}`}>{value}</div>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-slate-600">{label}</span>
    </div>
  );
}
