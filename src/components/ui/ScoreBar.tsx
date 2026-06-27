import { cn } from "../../lib/cn";

export function ScoreBar({
  value,
  label,
  compact
}: {
  value: number;
  label?: string;
  compact?: boolean;
}) {
  const tone =
    value >= 75 ? "bg-mint" : value >= 60 ? "bg-signal" : value >= 40 ? "bg-amber" : "bg-rose-400";

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      <div className="flex items-center justify-between gap-3">
        {label ? <span className="text-sm font-semibold text-current">{label}</span> : null}
        <span className="text-sm font-bold text-current">{value}/100</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/70">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}
