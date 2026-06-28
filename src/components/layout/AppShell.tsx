import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/Button";
import { FolderOpen, Plus, User } from "lucide-react";

export function AppShell() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="no-print sticky top-0 z-40 border-b border-white/16 bg-ink/92 shadow-[0_14px_42px_rgba(2,6,23,0.3)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/app/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-cyan-200/70 bg-signal text-sm font-black text-slate-950 shadow-[0_12px_34px_rgba(56,189,248,0.22)]">
              FP
            </span>
            <span>
              <span className="block text-sm font-black">Founder Pocket</span>
              <span className="block text-xs font-semibold text-slate-400">Observation-to-business workspace</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/app/dashboard">
              <Button variant="secondary" icon={<FolderOpen size={16} />}>
                Dashboard
              </Button>
            </Link>
            <Link to="/account">
              <Button variant="secondary" icon={<User size={16} />}>
                Account
              </Button>
            </Link>
            <Link to="/scan">
              <Button icon={<Plus size={16} />}>New Scan</Button>
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
