import { cn } from "@/lib/utils";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  /** stroke color (CSS color string). Defaults to `currentColor` */
  stroke?: string;
  /** Optional gradient fill under the line */
  fill?: boolean;
  strokeWidth?: number;
}

/**
 * Minimal SVG sparkline. Renders a smooth polyline with optional gradient
 * underfill and a highlighted endpoint dot. Reads color from `currentColor`
 * by default so it inherits text color via `text-*` utilities.
 */
export function Sparkline({
  data,
  width = 100,
  height = 28,
  className,
  stroke = "currentColor",
  fill = true,
  strokeWidth = 1.5,
}: Props) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const pad = strokeWidth + 1;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => (i === 0 ? `M${x.toFixed(2)},${y.toFixed(2)}` : `L${x.toFixed(2)},${y.toFixed(2)}`))
    .join(" ");

  const areaPath = `${linePath} L${width.toFixed(2)},${height} L0,${height} Z`;

  const [lastX, lastY] = points[points.length - 1];
  const gradId = `spark-grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      aria-hidden="true"
      focusable="false"
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradId})`} />
        </>
      )}
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill={stroke} />
      <circle cx={lastX} cy={lastY} r={5} fill={stroke} fillOpacity="0.18" className="signal-pulse" />
    </svg>
  );
}

/**
 * Builds a smooth pseudo-random sparkline series from a seed value.
 * Useful for visualizing trend without real time-series data.
 */
export function buildTrendSeries(seed: number, length = 14, amplitude = 0.5): number[] {
  const s = Math.max(1, seed);
  const out: number[] = [];
  let v = s * 0.6;
  for (let i = 0; i < length; i++) {
    const noise = Math.sin(i * 1.2 + s) * amplitude + Math.cos(i * 0.7 + s * 0.4) * amplitude * 0.6;
    v = Math.max(0, v + noise + (s - v) * 0.08);
    out.push(v);
  }
  out[out.length - 1] = s;
  return out;
}
