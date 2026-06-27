import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/Button";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="no-print sticky top-0 z-30 border-b border-white/10 bg-ink/82 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-signal text-sm font-black text-slate-950">
              FP
            </span>
            <span>
              <span className="block text-sm font-bold">Founder Pocket</span>
              <span className="block text-xs text-slate-400">Observation-to-business engine</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link to="/scan" className="hidden px-3 py-2 text-sm text-slate-300 hover:text-white md:block">
              Scan
            </Link>
            <Link to="/how-it-works" className="hidden px-3 py-2 text-sm text-slate-300 hover:text-white md:block">
              How it works
            </Link>
            <Link to="/about" className="hidden px-3 py-2 text-sm text-slate-300 hover:text-white md:block">
              What it is
            </Link>
            <Link to="/examples" className="hidden px-3 py-2 text-sm text-slate-300 hover:text-white lg:block">
              Examples
            </Link>
            <Link to="/app/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
            <Link to="/scan">
              <Button>Scan</Button>
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
