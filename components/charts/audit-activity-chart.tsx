"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
  boxShadow: "0 8px 24px -8px oklch(0.35 0.1 264 / 0.25)",
};

/** 最近 N 天操作次数（审计日志）：柱状图 */
export function AuditActivityChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "color-mix(in oklch, var(--brand) 8%, transparent)" }}
            formatter={(value) => [`${Number(value)} 次`, "操作"]}
          />
          <Bar
            dataKey="count"
            name="操作次数"
            fill="var(--brand-cool)"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
            animationDuration={700}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
