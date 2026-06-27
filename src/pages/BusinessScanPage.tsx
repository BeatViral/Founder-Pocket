import { ArrowRight, Download, Lightbulb, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BusinessAngleCard } from "../components/scan/BusinessAngleCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SaveGate, useUserProfile } from "../components/ui/SaveGate";
import { ScoreBar } from "../components/ui/ScoreBar";
import { statusTone } from "../lib/format";
import { storageService } from "../services/storageService";
import type { BusinessScan } from "../types";

export default function BusinessScanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [scan, setScan] = useState<BusinessScan | undefined>();
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    if (id) storageService.getScan(id).then(setScan);
  }, [id]);

  if (!scan) {
    return <NotFound label="Scan not found" />;
  }

  const save = async () => {
    if (!profile) {
      setPendingSave(true);
      setGateOpen(true);
      return;
    }
    const saved = await storageService.saveScan({ ...scan, saved: true });
    setScan(saved);
  };

  const onGateSaved = async () => {
    if (pendingSave) {
      const saved = await storageService.saveScan({ ...scan, saved: true });
      setScan(saved);
      setPendingSave(false);
    }
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scan.observationInput.id}-business-scan.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone={statusTone(scan.status)}>{scan.status}</Badge>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={save} icon={<Save size={16} />}>
                  {scan.saved ? "Saved" : "Save scan"}
                </Button>
                <Button variant="secondary" onClick={download} icon={<Download size={16} />}>
                  Download JSON
                </Button>
              </div>
            </div>
            <h1 className="mt-5 text-3xl font-black md:text-5xl">Business Scan</h1>
            <p className="mt-4 max-w-3xl text-xl leading-8 text-slate-200">
              "{scan.observationInput.observationText}"
            </p>
          </Card>

          <Card tone="light" className="p-6">
            <h2 className="text-2xl font-bold text-slate-950">What Founder Pocket thinks it means</h2>
            <p className="mt-3 leading-7 text-slate-600">{scan.interpretation}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {scan.signalTypes.map((signal) => (
                <span key={signal} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                  {signal}
                </span>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard title="Who may be affected" items={scan.affectedGroups} />
            <InfoCard title="Why it may matter" items={[scan.whyItMayMatter]} />
            <InfoCard
              title={scan.observationInput.founderContext ? "Founder lens" : "Current workaround"}
              items={[scan.observationInput.founderContext || scan.currentWorkaround]}
            />
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Suggested business angles</h2>
                <p className="mt-1 text-sm text-slate-400">Pick one to run through proof check.</p>
              </div>
              <Link to="/scan">
                <Button variant="secondary">Scan another</Button>
              </Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {scan.angles.map((angle) => (
                <BusinessAngleCard
                  key={angle.id}
                  angle={angle}
                  onSave={save}
                  onProof={() => navigate(`/proof-check/${scan.id}?angle=${angle.id}`)}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <Lightbulb className="text-signal" />
              <h2 className="font-bold">Business Potential Score</h2>
            </div>
            <ScoreBar value={scan.potentialScore.total} label={scan.potentialScore.label} />
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <SignalList title="Strong signals" items={scan.potentialScore.strongSignals} />
              <SignalList title="Weak signals" items={scan.potentialScore.weakSignals} />
              <SignalList title="Missing proof" items={scan.potentialScore.missingProof} />
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Recommended next step</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{scan.potentialScore.recommendedNextStep}</p>
            <Button className="mt-4" fullWidth icon={<ArrowRight size={16} />} onClick={() => navigate(`/proof-check/${scan.id}?angle=${scan.angles[0].id}`)}>
              Run proof check
            </Button>
            <Button className="mt-2" fullWidth variant="secondary" icon={<ArrowRight size={16} />} onClick={() => navigate(`/proof-check/${scan.id}?angle=${scan.angles[0].id}`)}>
              Continue to proof check
            </Button>
          </Card>
        </aside>
      </div>
      <SaveGate open={gateOpen} onClose={() => setGateOpen(false)} onSaved={onGateSaved} />
    </main>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card tone="light" className="p-5">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-slate-600">
            {item}
          </p>
        ))}
      </div>
    </Card>
  );
}

function SignalList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <ul className="mt-2 space-y-1">
        {(items.length ? items : ["No major item yet."]).map((item) => (
          <li key={item} className="text-slate-400">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotFound({ label }: { label: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <Card className="p-8">
        <h1 className="text-3xl font-bold">{label}</h1>
        <Link to="/scan" className="mt-6 inline-flex">
          <Button>Start a scan</Button>
        </Link>
      </Card>
    </main>
  );
}
