import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ScoreBar } from "../components/ui/ScoreBar";
import { storageService } from "../services/storageService";
import type { AnalyticsEvent, StartupDossier, BusinessScan } from "../types";

export default function AdminPage() {
  const [scans, setScans] = useState<BusinessScan[]>([]);
  const [dossiers, setDossiers] = useState<StartupDossier[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    Promise.all([
      storageService.listScans(),
      storageService.listDossiers(),
      storageService.listAnalyticsEvents()
    ]).then(([nextScans, nextDossiers, nextEvents]) => {
      setScans(nextScans);
      setDossiers(nextDossiers);
      setEvents(nextEvents);
    });
  }, []);

  const metrics = useMemo(() => {
    const readiness = dossiers.length ? Math.round(dossiers.reduce((sum, item) => sum + item.readinessScore.total, 0) / dossiers.length) : 0;
    const founderFit = dossiers.length ? Math.round(dossiers.reduce((sum, item) => sum + (item.founderFitEngine?.fitScore ?? 0), 0) / dossiers.length) : 0;
    const shares = dossiers.reduce((sum, item) => sum + item.shareLinks.length, 0);
    const exports = events.filter((event) => event.eventName === "pdf_exported").length;
    return { readiness, founderFit, shares, exports };
  }, [dossiers, events]);

  const eventCount = (name: string) => events.filter((event) => event.eventName === name).length;
  const signalCounts = scans.flatMap((scan) => scan.signalTypes).reduce<Record<string, number>>((acc, signal) => {
    acc[signal] = (acc[signal] ?? 0) + 1;
    return acc;
  }, {});
  const topSignals = Object.entries(signalCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <Badge tone="violet">Admin</Badge>
      <h1 className="mt-4 text-4xl font-black">Founder Pocket Admin</h1>
      <p className="mt-2 text-slate-400">Local analytics are shown until the backend metrics routes are connected.</p>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Observations" value={scans.length} />
        <Metric title="Dossiers" value={dossiers.length} />
        <Metric title="Share links" value={metrics.shares} />
        <Metric title="Exports" value={metrics.exports} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold">Funnel Analytics</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <Row label="Scans started" value={eventCount("observation_submitted")} />
            <Row label="Scans completed" value={eventCount("scan_generated")} />
            <Row label="Angles selected" value={eventCount("angle_selected")} />
            <Row label="Proof checks completed" value={eventCount("proof_check_completed")} />
            <Row label="Dossiers generated" value={eventCount("dossier_generated")} />
            <Row label="Shares created" value={eventCount("share_link_created")} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Score Distribution</h2>
          <div className="mt-4 space-y-5">
            <ScoreBar value={metrics.readiness} label="Average readiness score" />
            <ScoreBar value={metrics.founderFit} label="Average founder fit score" />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Observation Analytics</h2>
          <div className="mt-4 space-y-2">
            {topSignals.map(([signal, count]) => (
              <Row key={signal} label={signal} value={count} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">AI Job Monitor</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">AI provider is scaffolded server-side. No live AI jobs have run in local mode.</p>
          <div className="mt-4 rounded-md border border-white/10 bg-white/[0.05] p-3 text-sm text-slate-400">
            Failed generations: 0 · Model: mock-founder-pocket
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Content / Prompt Controls</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Proof questions, dossier templates, validation sprint templates, and score weights are ready to move behind AdminSetting records.
          </p>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">System Health</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Frontend local mode is healthy. Backend routes and Prisma schema are scaffolded for production deployment.
          </p>
        </Card>
      </section>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.05] px-3 py-2">
      <span>{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
