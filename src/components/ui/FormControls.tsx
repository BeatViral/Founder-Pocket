import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function FieldLabel({
  label,
  helper,
  children
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-extrabold text-slate-100">{label}</span>
      {helper ? <span className="mt-1 block text-sm text-slate-400">{helper}</span> : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-white/18 bg-slate-950/85 px-3 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/25",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-white/18 bg-slate-950/65 px-3 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition placeholder:text-slate-500 focus:border-signal focus:ring-2 focus:ring-signal/25",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-md border border-white/18 bg-slate-950/65 px-3 py-3 text-sm font-medium leading-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition placeholder:text-slate-500 focus:border-signal focus:ring-2 focus:ring-signal/25",
        className
      )}
      {...props}
    />
  );
}
