"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WEEKLY_MINDFULNESS } from "@/data/karmaDashboardMock";
import { GlassChartTooltip } from "./GlassChartTooltip";

const chartData = WEEKLY_MINDFULNESS.map((d) => ({
  label: d.dayLabel,
  date: d.date,
  score: d.score,
  displayLabel: `${d.date} (${d.dayLabel})`,
}));

const AXIS_STYLE = { stroke: "#e7e5e4", strokeOpacity: 0.3 };

function MindfulnessTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { displayLabel?: string; score?: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  if (!row) return null;

  return (
    <GlassChartTooltip
      active
      label={row.displayLabel}
      payload={[
        { name: "달성도", value: row.score, color: "#0d9488" },
      ]}
      valueSuffix="%"
    />
  );
}

export function MindfulnessTrendChart() {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#e7e5e4"
            strokeOpacity={0.3}
          />
          <XAxis
            dataKey="label"
            axisLine={AXIS_STYLE}
            tickLine={false}
            tick={{ fill: "#a8a29e", fontSize: 10 }}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a8a29e", fontSize: 10 }}
            ticks={[0, 50, 100]}
          />
          <Tooltip content={<MindfulnessTooltip />} />
          <Bar
            dataKey="score"
            name="달성도"
            fill="#0d9488"
            fillOpacity={0.6}
            radius={[6, 6, 0, 0]}
            barSize={18}
            isAnimationActive
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="score"
            name="흐름"
            stroke="#0d9488"
            strokeWidth={1.5}
            fill="#fef3c7"
            fillOpacity={0.35}
            dot={false}
            isAnimationActive
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
