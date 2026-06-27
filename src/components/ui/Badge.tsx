import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Tone = "success" | "warning" | "info" | "neutral" | "violet";

const tones: Record<Tone, string> = {
  success: "border-emerald-300/70 bg-emerald-100 text-emerald-800",
  warning: "border-amber-300/80 bg-amber-100 text-amber-800",
  info: "border-cyan-300/80 bg-cyan-100 text-cyan-800",
  violet: "border-violet-300/80 bg-violet-100 text-violet-800",
  neutral: "border-slate-300 bg-slate-100 text-slate-700"
};

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
