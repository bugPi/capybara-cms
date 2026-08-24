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

/** 分类文章数：横向条形图 */
export function CategoryBarsChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  const chartData = data.filter((d) => d.count > 0);
  if (chartData.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        暂无分类数据
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={76}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "color-mix(in oklch, var(--brand) 8%, transparent)" }}
            formatter={(value) => [`${Number(value)} 篇`, ""]}
          />
          <Bar
            dataKey="count"
            name="文章数"
            fill="var(--brand)"
            radius={[0, 6, 6, 0]}
            maxBarSize={18}
            animationDuration={700}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
