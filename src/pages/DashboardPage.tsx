import { Download, ExternalLink, FileText, FolderOpen, ListChecks, ScanSearch, Settings, Trash2, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CopyButton } from "../components/ui/CopyButton";
import { ScoreBar } from "../components/ui/ScoreBar";
import { formatDate, statusTone } from "../lib/format";
import { analyticsService } from "../services/analyticsService";
import { storageService } from "../services/storageService";
import type { BusinessScan, FounderProfile, StartupDossier, UserProfile, ValidationTask } from "../types";

export default function DashboardPage() {
  const [scans, setScans] = useState<BusinessScan[]>([]);
  const [dossiers, setDossiers] = useState<StartupDossier[]>([]);
  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [founderProfile, setFounderProfile] = useState<FounderProfile | undefined>();

  const refresh = async () => {
    const [nextScans, nextDossiers, nextProfile, nextFounderProfile] = await Promise.all([
      storageService.listScans(),
      storageService.listDossiers(),
      storageService.getUserProfile(),
      storageService.getFounderProfile()
    ]);
    setScans(nextScans);
    setDossiers(nextDossiers);
    setProfile(nextProfile);
    setFounderProfile(nextFounderProfile);
  };

  useEffect(() => {
    analyticsService.track("dashboard_opened");
    refresh();
  }, []);

  const deleteScan = async (id: string) => {
    await storageService.deleteScan(id);
    refresh();
  };

  const deleteDossier = async (id: string) => {
    await storageService.deleteDossier(id);
    refresh();
  };

  const stats = useMemo(() => {
    const tasks = dossiers.flatMap((dossier) => dossier.validationTasks ?? []);
    const doneTasks = tasks.filter((task) => task.status === "done");
    const averageReadiness = dossiers.length
      ? Math.round(dossiers.reduce((sum, dossier) => sum + dossier.readinessScore.total, 0) / dossiers.length)
      : 0;
    const activeShares = dossiers.flatMap((dossier) => dossier.shareLinks).filter((link) => link.isActive).length;

    return {
      observations: scans.length,
      scans: scans.length,
      dossiers: dossiers.length,
      averageReadiness,
      validationDue: tasks.filter((task) => task.status !== "done").length,
      activeShares,
      doneTasks: doneTasks.length,
      tasks
    };
  }, [dossiers, scans.length]);

  const latestDossier = dossiers[0];
  const nextTask = stats.tasks.find((task) => task.status !== "done");

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="info">Workspace</Badge>
          <h1 className="mt-3 text-4xl font-black">My Founder Pocket</h1>
          <p className="mt-2 text-slate-400">
            Saved observations, scans, dossiers, validation work, and exports.
            {profile ? ` Signed in locally as ${profile.name}.` : " Guest mode is active."}
          </p>
        </div>
        <Link to="/scan">
          <Button icon={<ScanSearch size={18} />}>New scan</Button>
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric title="Observations" value={stats.observations} />
        <Metric title="Scans" value={stats.scans} />
        <Metric title="Dossiers" value={stats.dossiers} />
        <Metric title="Avg readiness" value={`${stats.averageReadiness}/100`} />
        <Metric title="Tasks due" value={stats.validationDue} />
        <Metric title="Active shares" value={stats.activeShares} />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard icon={<ScanSearch />} title="Saved Observations">
          <div className="space-y-3">
            {scans.slice(0, 5).map((scan) => (
              <Row key={scan.id}>
                <div>
                  <div className="font-semibold text-white">{scan.observationInput.observationText}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatDate(scan.createdAt)} · {scan.status}</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/app/scan/${scan.id}`}><Button variant="secondary" icon={<ExternalLink size={16} />}>Open</Button></Link>
                  <Button variant="danger" onClick={() => deleteScan(scan.id)} icon={<Trash2 size={16} />}>Delete</Button>
                </div>
              </Row>
            ))}
            {!scans.length ? <EmptyState label="No saved observations yet." /> : null}
          </div>
        </SectionCard>

        <SectionCard icon={<FolderOpen />} title="Business Scans">
          <div className="space-y-4">
            {scans.slice(0, 3).map((scan) => (
              <Card key={scan.id} tone="light" className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge tone={statusTone(scan.status)}>{scan.status}</Badge>
                  <span className="text-xs text-slate-500">{formatDate(scan.updatedAt)}</span>
                </div>
                <h3 className="mt-3 font-bold text-slate-950">{scan.angles[0]?.name ?? "No angle yet"}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">{scan.signalTypes.join(", ")}</p>
                <div className="mt-3">
                  <ScoreBar value={scan.potentialScore.total} label={scan.potentialScore.label} />
                </div>
              </Card>
            ))}
            {!scans.length ? <EmptyState label="No scans yet." /> : null}
          </div>
        </SectionCard>

        <SectionCard icon={<FileText />} title="Startup Dossiers">
          <div className="grid gap-4 lg:grid-cols-2">
            {dossiers.map((dossier) => (
              <Card key={dossier.id} tone="light" className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge tone={statusTone(dossier.status)}>{dossier.status}</Badge>
                  <span className="text-xs text-slate-500">{formatDate(dossier.updatedAt)}</span>
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-950">{dossier.startupName}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{dossier.oneLiner}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ScoreBar value={dossier.readinessScore.total} label="Readiness" />
                  <ScoreBar value={dossier.founderFitEngine?.fitScore ?? 0} label="Founder fit" />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Missing proof: {dossier.missingProofItems.length} · Shares: {dossier.shareLinks.filter((link) => link.isActive).length}
                </p>
                <p className="mt-2 text-xs text-slate-500">Next action: {dossier.readinessScore.nextActions[0]}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/app/dossier/${dossier.id}`}><Button variant="quiet" icon={<ExternalLink size={16} />}>Open</Button></Link>
                  <Button variant="danger" onClick={() => deleteDossier(dossier.id)} icon={<Trash2 size={16} />}>Delete</Button>
                </div>
              </Card>
            ))}
            {!dossiers.length ? <EmptyState label="No dossiers yet." /> : null}
          </div>
        </SectionCard>

        <SectionCard icon={<ListChecks />} title="Validation Tracker">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric title="Tasks completed" value={stats.doneTasks} />
            <Metric title="Evidence missing" value={stats.validationDue} />
            <Metric title="Interviews logged" value={stats.tasks.filter((task) => /interview/i.test(task.title)).length} />
            <Metric title="Pricing tests" value={stats.tasks.filter((task) => /price|paid|pilot/i.test(task.title)).length} />
          </div>
          <div className="mt-4 rounded-md border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-300">
            Next proof gap: {nextTask?.title ?? "No active validation task."}
          </div>
        </SectionCard>

        <SectionCard icon={<UserRound />} title="Founder Fit Profile">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Founder archetype" value={latestDossier?.founderFitEngine?.primaryArchetype ?? "Not enough data yet"} />
            <Info label="Preferred path" value={latestDossier?.founderFitEngine?.validationPath ?? founderProfile?.validationComfort ?? "Not set"} />
            <Info label="Communication style" value={latestDossier?.founderFitEngine?.communicationStyle ?? founderProfile?.communicationStyle ?? "Not set"} />
            <Info label="Weak spots" value={latestDossier?.founderFitEngine?.weakSignals[0] ?? "No dossier yet"} />
          </div>
          <Link to="/account" className="mt-4 inline-flex"><Button variant="secondary">Edit founder profile</Button></Link>
        </SectionCard>

        <SectionCard icon={<Download />} title="Export Center">
          {latestDossier ? (
            <div className="flex flex-wrap gap-2">
              <CopyButton text={latestDossier.sections.find((section) => section.type === "snapshot")?.content ?? ""} label="Copy Snapshot" />
              <CopyButton text={latestDossier.sections.find((section) => section.type === "accelerator_answers")?.content ?? ""} label="Copy Accelerator Answers" />
              <CopyButton text={latestDossier.sections.find((section) => section.type === "mvp_build_brief")?.content ?? ""} label="Copy Builder Brief" />
              <Link to={`/app/dossier/${latestDossier.id}`}><Button variant="secondary">Open exports</Button></Link>
            </div>
          ) : (
            <EmptyState label="Generate a dossier to unlock exports." />
          )}
        </SectionCard>

        <SectionCard icon={<Settings />} title="Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Profile" value={profile ? `${profile.name} · ${profile.email}` : "No local account"} />
            <Info label="Founder background" value={founderProfile?.background || "Not set"} />
            <Info label="Risk comfort" value={founderProfile?.riskComfort || "Not set"} />
            <Info label="Backend mode" value={import.meta.env.VITE_ENABLE_BACKEND === "true" ? "Backend enabled" : "Local demo mode"} />
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-black uppercase text-slate-400">{title}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </Card>
  );
}

function SectionCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="xl:col-span-2">
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-signal">{icon}</span>
          <h2 className="text-xl font-black">{title}</h2>
        </div>
        {children}
      </Card>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/16 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/16 bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="text-xs font-black uppercase text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold leading-6 text-slate-100">{value}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-white/16 bg-white/[0.06] p-4 text-sm font-semibold text-slate-300">
      {label}
    </div>
  );
}
