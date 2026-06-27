import { ExternalLink, FileText, ScanSearch, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ScoreBar } from "../components/ui/ScoreBar";
import { formatDate, statusTone } from "../lib/format";
import { storageService } from "../services/storageService";
import type { BusinessScan, StartupDossier, UserProfile } from "../types";

export default function DashboardPage() {
  const [scans, setScans] = useState<BusinessScan[]>([]);
  const [dossiers, setDossiers] = useState<StartupDossier[]>([]);
  const [profile, setProfile] = useState<UserProfile | undefined>();

  const refresh = async () => {
    const [nextScans, nextDossiers, nextProfile] = await Promise.all([
      storageService.listScans(),
      storageService.listDossiers(),
      storageService.getUserProfile()
    ]);
    setScans(nextScans);
    setDossiers(nextDossiers);
    setProfile(nextProfile);
  };

  useEffect(() => {
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

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">My Founder Pocket</h1>
          <p className="mt-2 text-slate-400">
            Saved observations, business scans, and startup dossiers.
            {profile ? ` Signed in locally as ${profile.name}.` : " Guest mode is active."}
          </p>
        </div>
        <Link to="/scan">
          <Button icon={<ScanSearch size={18} />}>New scan</Button>
        </Link>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <ScanSearch className="text-signal" />
          <h2 className="text-2xl font-bold">Saved business scans</h2>
        </div>
        {scans.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {scans.map((scan) => (
              <Card key={scan.id} tone="light" className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge tone={statusTone(scan.status)}>{scan.status}</Badge>
                  <span className="text-xs text-slate-500">{formatDate(scan.updatedAt)}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">{scan.observationInput.observationText}</h3>
                <p className="mt-2 text-sm text-slate-600">Best angle: {scan.angles[0]?.name}</p>
                <div className="mt-4">
                  <ScoreBar value={scan.potentialScore.total} label={scan.potentialScore.label} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/app/scan/${scan.id}`}>
                    <Button variant="quiet" icon={<ExternalLink size={16} />}>
                      Open
                    </Button>
                  </Link>
                  <Button variant="danger" onClick={() => deleteScan(scan.id)} icon={<Trash2 size={16} />}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState label="No scans yet." />
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <FileText className="text-violet-300" />
          <h2 className="text-2xl font-bold">Startup dossiers</h2>
        </div>
        {dossiers.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {dossiers.map((dossier) => (
              <Card key={dossier.id} tone="light" className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge tone={statusTone(dossier.status)}>{dossier.status}</Badge>
                  <span className="text-xs text-slate-500">{formatDate(dossier.updatedAt)}</span>
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-950">{dossier.startupName}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{dossier.oneLiner}</p>
                <p className="mt-3 text-xs text-slate-500">Missing proof: {dossier.missingProofItems.length}</p>
                <div className="mt-4">
                  <ScoreBar value={dossier.readinessScore.total} label={dossier.readinessScore.label} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/app/dossier/${dossier.id}`}>
                    <Button variant="quiet" icon={<ExternalLink size={16} />}>
                      Open
                    </Button>
                  </Link>
                  <Button variant="danger" onClick={() => deleteDossier(dossier.id)} icon={<Trash2 size={16} />}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState label="No dossiers yet." />
        )}
      </section>
    </main>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-slate-300">{label}</p>
      <Link to="/scan" className="mt-5 inline-flex">
        <Button>Start with an observation</Button>
      </Link>
    </Card>
  );
}
