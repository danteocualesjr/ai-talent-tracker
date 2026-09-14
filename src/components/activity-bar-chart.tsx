import { cn } from "@/lib/utils";

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
        aria-label={`Activity chart showing ${data.reduce((a, b) => a + b, 0)} events over ${data.length} days`}
      >
        {bars.map(({ x, y, w, h, v, i }) => (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={w}
              height={Math.max(h, v > 0 ? 1.5 : 0)}
              rx={0.8}
              className={cn(
                "fill-signal/75 transition-opacity hover:fill-signal",
                v === max && max > 0 && "fill-signal",
                barClassName,
              )}
            >
              <title>
                {labels?.[i]
                  ? `${labels[i]}: ${v} event${v === 1 ? "" : "s"}`
                  : `${v} event${v === 1 ? "" : "s"}`}
              </title>
            </rect>
          </g>
        ))}
      </svg>
      {labels && labels.length === data.length && (
        <figcaption className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span className="tnum">{formatShortDate(labels[0])}</span>
          <span className="tnum hidden sm:inline">{formatShortDate(labels[Math.floor(labels.length / 2)])}</span>
          <span className="tnum">{formatShortDate(labels[labels.length - 1])}</span>
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

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
