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
        {label ? <span className="text-sm font-extrabold text-current">{label}</span> : null}
        <span className="text-sm font-black text-current">{value}/100</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-slate-300/70 bg-slate-200/80 shadow-inner">
        <div className={cn("h-full rounded-full shadow-[0_0_22px_rgba(56,189,248,0.25)]", tone)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}
