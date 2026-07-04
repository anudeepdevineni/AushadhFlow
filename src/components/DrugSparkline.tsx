import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";

type Props = { drugName: string; history: number[] };

export default function DrugSparkline({ drugName, history }: Props) {
  const data = history.map((units, i) => ({ day: i + 1, units }));

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900">Consumption trend</h3>
      <p className="mt-1 text-xs text-slate-500">{drugName} · last 30 days</p>

      <div className="mt-4 h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="afSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip
              cursor={{ stroke: "#c7d2fe", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 6px 16px rgba(2,6,23,0.08)",
                fontSize: 12,
              }}
              formatter={(value) => [`${value} units`, "used"]}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Area
              type="monotone"
              dataKey="units"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#afSpark)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
