import { ArrowRight, Save } from "lucide-react";
import type { BusinessAngle } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function BusinessAngleCard({
  angle,
  onProof,
  onSave
}: {
  angle: BusinessAngle;
  onProof: () => void;
  onSave: () => void;
}) {
  return (
    <Card tone="light" className="flex h-full flex-col p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="info">{angle.businessType}</Badge>
        <Badge tone="neutral">Potential {angle.potential}/100</Badge>
      </div>
      <h3 className="text-xl font-bold text-slate-950">{angle.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{angle.oneLineDescription}</p>
      <dl className="mt-5 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-slate-950">Who it helps</dt>
          <dd className="mt-1 text-slate-600">{angle.whoItHelps}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-950">First version</dt>
          <dd className="mt-1 text-slate-600">{angle.firstVersion}</dd>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Metric label="Difficulty" value={angle.difficulty} />
          <Metric label="Risk" value={angle.risk} />
          <Metric label="Fit" value={angle.founderFit} />
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button onClick={onProof} icon={<ArrowRight size={16} />}>
          Run proof check
        </Button>
        <Button variant="quiet" onClick={onSave} icon={<Save size={16} />}>
          Save idea
        </Button>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-100 p-2 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-bold text-slate-950">{value}/10</div>
    </div>
  );
}
