"use client";

type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

type GlassChartTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  valueSuffix?: string;
  labelFormatter?: (label: string) => string;
};

export function GlassChartTooltip({
  active,
  label,
  payload,
  valueSuffix = "",
  labelFormatter,
}: GlassChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const displayLabel = label
    ? labelFormatter
      ? labelFormatter(label)
      : label
    : null;

  return (
    <div className="rounded-xl border border-white/50 bg-white/75 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md">
      {displayLabel && (
        <p className="mb-1.5 font-sans text-[10px] font-semibold tracking-wide text-stone-500">
          {displayLabel}
        </p>
      )}
      <ul className="space-y-1">
        {payload.map((entry, i) => (
          <li
            key={`${entry.name ?? i}`}
            className="flex items-center gap-2 font-sans text-xs text-stone-700"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color ?? "#0d9488" }}
            />
            <span className="text-stone-500">{entry.name}</span>
            <span className="ml-auto font-serif font-semibold text-teal-800">
              {entry.value}
              {valueSuffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
