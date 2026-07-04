"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  MONTHLY_KARMA_DISTRIBUTION,
  MONTHLY_KARMA_TOTAL,
} from "@/data/karmaDashboardMock";
import { GlassChartTooltip } from "./GlassChartTooltip";

const chartData = MONTHLY_KARMA_DISTRIBUTION.map((item) => ({
  name: item.label,
  value: item.count,
  color: item.color,
}));

export function KarmaDonutChart() {
  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            isAnimationActive
            animationBegin={0}
            animationDuration={900}
            animationEasing="ease-out"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={
              <GlassChartTooltip valueSuffix="회" labelFormatter={(l) => l} />
            }
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl font-bold tracking-tight text-teal-800">
          {MONTHLY_KARMA_TOTAL}
        </span>
        <span className="mt-0.5 font-sans text-[10px] tracking-widest text-stone-400">
          이번 달 번뇌
        </span>
      </div>
    </div>
  );
}
