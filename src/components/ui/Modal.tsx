import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/84 px-4 backdrop-blur-md">
      <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-lg border border-white/18 bg-coal p-5 shadow-premium ring-1 ring-white/[0.04]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-white">{title}</h2>
          <Button variant="ghost" className="h-9 w-9 px-0" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
