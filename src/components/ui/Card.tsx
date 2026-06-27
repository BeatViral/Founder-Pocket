import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  tone?: "dark" | "light" | "glass";
};

export function Card({ className, children, tone = "glass", ...props }: CardProps) {
  const tones = {
    dark: "border-white/10 bg-coal text-white shadow-panel",
    light: "border-slate-200 bg-white text-slate-950 shadow-sm",
    glass: "border-white/10 bg-white/[0.06] text-white shadow-panel backdrop-blur"
  };

  return (
    <div className={cn("rounded-lg border", tones[tone], className)} {...props}>
      {children}
    </div>
  );
}
