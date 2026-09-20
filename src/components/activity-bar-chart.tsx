import { cn, formatShortDate } from "@/lib/utils";

type Props = {
  data: number[];
  /** ISO dates for each bucket (same length as data), oldest first */
  labels?: string[];
  height?: number;
  className?: string;
  barClassName?: string;
};

/**
 * Accessible bar chart for daily activity counts. Server-rendered SVG.
 */
export function ActivityBarChart({
  data,
  labels,
  height = 120,
  className,
  barClassName,
}: Props) {
  if (data.length === 0) return null;

  const width = 100;
  const padTop = 4;
  const padBottom = 2;
  const max = Math.max(...data, 1);
  const barWidth = width / data.length;
  const innerH = height - padTop - padBottom;

  const total = data.reduce((a, b) => a + b, 0);
  const baselineY = padTop + innerH;

  const bars = data.map((v, i) => {
    const h = (v / max) * innerH;
    const x = i * barWidth + barWidth * 0.12;
    const w = barWidth * 0.76;
    const y = padTop + innerH - h;
    return { x, y, w, h, v, i };
  });

  return (
    <figure className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Activity chart showing ${total} events over ${data.length} days`}
      >
        <line
          x1={0}
          y1={baselineY}
          x2={width}
          y2={baselineY}
          className="stroke-border/80"
          strokeWidth={0.35}
          vectorEffect="non-scaling-stroke"
        />
        {bars.map(({ x, y, w, h, v, i }) => (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={w}
              height={Math.max(h, v > 0 ? 1.5 : 0)}
              rx={0.8}
              className={cn(
                "fill-signal/60 motion-safe:transition-[fill-opacity] hover:fill-signal/90",
                v === max && max > 0 && "fill-signal drop-shadow-[0_0_2px_hsl(var(--signal)/0.45)]",
                v === 0 && "fill-muted-foreground/15",
                barClassName,
              )}
            >
              <title>
                {labels?.[i]
                  ? `${formatShortDate(labels[i])}: ${v} event${v === 1 ? "" : "s"}`
                  : `Day ${i + 1}: ${v} event${v === 1 ? "" : "s"}`}
              </title>
            </rect>
          </g>
        ))}
      </svg>
      {labels && labels.length === data.length && (
        <figcaption className="mt-2.5 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <span className="tnum shrink-0">{formatShortDate(labels[0])}</span>
          <span className="tnum hidden min-w-0 truncate text-center font-medium text-foreground/80 sm:inline">
            {total} event{total === 1 ? "" : "s"} · {data.length}d
          </span>
          <span className="tnum shrink-0">{formatShortDate(labels[labels.length - 1])}</span>
        </figcaption>
      )}
      <div className="sr-only">
        {bars.map(({ v, i }) => (
          <span key={i}>
            {labels?.[i] ?? `Day ${i + 1}`}: {v}
          </span>
        ))}
      </div>
    </figure>
  );
}

/** Build ISO date strings for the last N days (oldest first). */
export function buildDayLabels(days: number): string[] {
  const out: string[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    out.push(d.toISOString());
  }
  return out;
}
