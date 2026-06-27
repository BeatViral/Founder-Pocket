import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "quiet";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  fullWidth?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-signal text-slate-950 hover:bg-cyan-300 shadow-glow border-transparent",
  secondary:
    "bg-white/10 text-white hover:bg-white/15 border-white/15",
  ghost:
    "bg-transparent text-slate-200 hover:bg-white/10 border-transparent",
  quiet:
    "bg-slate-100 text-slate-900 hover:bg-white border-slate-200",
  danger:
    "bg-rose-500/14 text-rose-100 hover:bg-rose-500/22 border-rose-300/20"
};

export function Button({
  className,
  variant = "primary",
  icon,
  fullWidth,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
