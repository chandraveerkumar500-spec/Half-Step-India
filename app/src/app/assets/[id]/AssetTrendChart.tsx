"use client";

import { ResponsiveContainer, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

type TrendDatum = {
  label: string;
  score: number;
};

export default function AssetTrendChart({ data }: { data: TrendDatum[] }) {
  if (data.length === 0) return null;

  return (
    <div className="surface-card p-6">
      <div className="mb-5">
        <div className="section-kicker">Trend</div>
        <h3 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground">
          Degradation timeline
        </h3>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b6258" }} tickLine={false} axisLine={false} />
            <YAxis
              domain={[0, 2]}
              ticks={[0, 0.5, 1, 1.5, 2]}
              tick={{ fontSize: 12, fill: "#6b6258" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(117, 107, 96, 0.15)",
                boxShadow: "0 12px 32px rgba(32, 29, 25, 0.08)",
              }}
            />
            <Line type="monotone" dataKey="score" stroke="#0b6e4f" strokeWidth={3} dot={{ r: 5, fill: "#0b6e4f" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
