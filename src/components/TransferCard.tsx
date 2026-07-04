import type { TransferSuggestion } from "../engines/matchingEngine";
import { inr, pricePerUnit } from "../lib/util";
import { IconRoute, IconLeaf, IconMapPin, IconClock, IconBox } from "./icons";

export default function TransferCard({ transfer }: { transfer: TransferSuggestion }) {
  const wasteValue = transfer.preventsWaste
    ? transfer.transferUnits * pricePerUnit(transfer.drugName)
    : 0;
  const matchPct = Math.round(transfer.score * 100);

  return (
    <div className="af-rise overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
      {/* header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <IconRoute className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Suggested transfer</h2>
            <p className="text-sm text-slate-500">{transfer.drugName}</p>
          </div>
        </div>
        <span
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
          title="Engine match score — how well this option balances coverage, expiry and distance"
        >
          {matchPct}% match
        </span>
      </div>

      {/* from -> to flow */}
      <div className="mt-5 flex items-center gap-3 px-5">
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">From</div>
          <div className="truncate font-semibold text-slate-900">{transfer.fromCentreName}</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="rounded-lg bg-indigo-600 px-3 py-1.5 text-center text-white shadow-sm">
            <div className="text-lg font-bold leading-none">{transfer.transferUnits}</div>
            <div className="text-[10px] uppercase tracking-wide text-indigo-100">units</div>
          </div>
          <div className="relative mt-2 h-0.5 w-16 overflow-hidden rounded bg-indigo-100">
            <div className="af-flow absolute inset-0" />
          </div>
        </div>

        <div className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-indigo-400">To</div>
          <div className="truncate font-semibold text-slate-900">{transfer.toCentreName}</div>
        </div>
      </div>

      {/* waste-prevention banner */}
      {transfer.preventsWaste && (
        <div className="mx-5 mt-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <IconLeaf className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            <span className="font-semibold">Dual payoff:</span> prevents a stockout <em>and</em> saves{" "}
            {transfer.transferUnits} units of {transfer.drugName} from expiring
            {wasteValue ? <> — about {inr(wasteValue)}</> : null}.
          </p>
        </div>
      )}

      {/* stat row */}
      <div className="mt-5 grid grid-cols-3 gap-3 px-5">
        <Stat icon={<IconMapPin className="h-4 w-4" />} label="Distance" value={`${transfer.distanceKm.toFixed(1)} km`} />
        <Stat icon={<IconClock className="h-4 w-4" />} label="Source expires" value={`${transfer.sourceExpiresInDays} d`} />
        <Stat icon={<IconBox className="h-4 w-4" />} label="Waste prevented" value={wasteValue ? inr(wasteValue) : "—"} />
      </div>

      {/* reasoning */}
      <p className="m-5 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-100">
        {transfer.reasoning}
      </p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1 font-bold text-slate-900">{value}</div>
    </div>
  );
}
