import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { BusinessAngleCard } from "../components/scan/BusinessAngleCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ScoreBar } from "../components/ui/ScoreBar";
import { sampleScans } from "../lib/sampleData";

export default function ExamplesPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <Badge tone="info">Examples</Badge>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">Observation in. Business angles out.</h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">
          These examples show the product posture: simple front door, serious output underneath.
        </p>
      </div>

      <div className="space-y-10">
        {sampleScans.map((scan) => (
          <Card key={scan.id} className="p-5 md:p-6">
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <div>
                <Badge tone="violet">{scan.status}</Badge>
                <h2 className="mt-4 text-2xl font-bold">{scan.observationInput.observationText}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{scan.interpretation}</p>
                <div className="mt-5">
                  <ScoreBar value={scan.potentialScore.total} label={scan.potentialScore.label} />
                </div>
                <Link to="/scan" state={{ observationText: scan.observationInput.observationText }} className="mt-5 inline-flex">
                  <Button icon={<ArrowRight size={16} />}>Run this scan</Button>
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {scan.angles.slice(0, 2).map((angle) => (
                  <BusinessAngleCard
                    key={angle.id}
                    angle={angle}
                    onProof={() => navigate(`/proof-check/${scan.id}?angle=${angle.id}`)}
                    onSave={() => navigate(`/app/scan/${scan.id}`)}
                  />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
