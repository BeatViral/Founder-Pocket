import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Tone = "success" | "warning" | "info" | "neutral" | "violet";

const tones: Record<Tone, string> = {
  success: "border-emerald-300 bg-emerald-100 text-emerald-900 shadow-sm",
  warning: "border-amber-300 bg-amber-100 text-amber-900 shadow-sm",
  info: "border-cyan-300 bg-cyan-100 text-cyan-900 shadow-sm",
  violet: "border-violet-300 bg-violet-100 text-violet-900 shadow-sm",
  neutral: "border-slate-300 bg-slate-100 text-slate-800 shadow-sm"
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
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-black",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
