import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/Button";
import { FolderOpen, Plus } from "lucide-react";

export function AppShell() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-ink/88 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/app/dashboard" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-signal text-sm font-black text-slate-950">
              FP
            </span>
            <span>
              <span className="block text-sm font-bold">Founder Pocket</span>
              <span className="block text-xs text-slate-400">Your startup entry room</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/app/dashboard">
              <Button variant="secondary" icon={<FolderOpen size={16} />}>
                Dashboard
              </Button>
            </Link>
            <Link to="/start">
              <Button icon={<Plus size={16} />}>New Dossier</Button>
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
