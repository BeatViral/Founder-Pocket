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
    "border-cyan-200/70 bg-signal text-slate-950 shadow-[0_16px_46px_rgba(56,189,248,0.22)] hover:bg-cyan-300 hover:shadow-[0_18px_58px_rgba(56,189,248,0.3)]",
  secondary:
    "border-white/18 bg-white/[0.105] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-white/28 hover:bg-white/[0.15]",
  ghost:
    "border-transparent bg-transparent text-slate-200 hover:bg-white/10",
  quiet:
    "border-slate-300 bg-slate-100 text-slate-950 shadow-sm hover:bg-white hover:border-slate-400",
  danger:
    "border-rose-300/28 bg-rose-500/16 text-rose-100 hover:bg-rose-500/24"
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
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-extrabold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
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
