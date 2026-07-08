import { formatLoad } from "@/lib/server-status";
import { cn } from "@/lib/utils";

const SIZE = 56;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface LoadRingChartProps {
  label: string;
  value: number | null;
  percent: number | null;
}

export function LoadRingChart({ label, value, percent }: LoadRingChartProps) {
  const fill = percent ?? 0;
  const offset = CIRCUMFERENCE - (fill / 100) * CIRCUMFERENCE;
  const ringClass =
    fill >= 90
      ? "stroke-[var(--color-destructive)]"
      : fill >= 70
        ? "stroke-[var(--color-warning)]"
        : "stroke-[var(--color-primary)]";

  return (
    <div className="flex flex-col items-center gap-1.5 bg-[var(--color-secondary)]/50 p-2">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          aria-hidden
          className="-rotate-90"
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
        >
          <circle
            className="stroke-[var(--color-border)]"
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            r={RADIUS}
            strokeWidth={STROKE}
          />
          <circle
            className={cn("transition-all duration-500", ringClass)}
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth={STROKE}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium tabular-nums">
          {formatLoad(value)}
        </div>
      </div>
      <div className="text-center text-[11px] text-[var(--color-muted-foreground)]">
        {label}
      </div>
    </div>
  );
}
