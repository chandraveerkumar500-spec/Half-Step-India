"use client";

import { ResponsiveContainer, Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";

type DashboardChartDatum = {
  label: string;
  count: number;
  fill: string;
};

export default function DashboardClient({ chartData }: { chartData: DashboardChartDatum[] }) {
  return (
    <div className="surface-card p-6">
      <div className="mb-5">
        <div className="section-kicker">Distribution</div>
        <h3 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground">
          Asset health breakdown
        </h3>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 12, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              width={110}
              tick={{ fontSize: 12, fill: "#6b6258" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f1eee7" }}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(117, 107, 96, 0.15)",
                boxShadow: "0 12px 32px rgba(32, 29, 25, 0.08)",
              }}
            />
            <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
