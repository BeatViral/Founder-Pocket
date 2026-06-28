import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  tone?: "dark" | "light" | "glass";
};

export function Card({ className, children, tone = "glass", ...props }: CardProps) {
  const tones = {
    dark: "border-white/16 bg-coal text-white shadow-premium ring-1 ring-white/[0.04]",
    light: "border-slate-300/90 bg-white text-slate-950 shadow-premium-light ring-1 ring-slate-950/[0.03]",
    glass: "border-white/16 bg-white/[0.075] text-white shadow-premium backdrop-blur-xl ring-1 ring-white/[0.04]"
  };

  return (
    <div className={cn("rounded-lg border", tones[tone], className)} {...props}>
      {children}
    </div>
  );
}
