import { FileText } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FieldLabel, Textarea } from "../components/ui/FormControls";
import { SaveGate, useUserProfile } from "../components/ui/SaveGate";
import { ScoreBar } from "../components/ui/ScoreBar";
import {
  createProofAnswers,
  generateProofCheckQuestions,
  generateStartupDossier
} from "../services/generationService";
import { calculateStartupReadinessScore } from "../services/scoringService";
import { storageService } from "../services/storageService";
import type { BusinessAngle, BusinessScan } from "../types";

export default function ProofCheckPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [scan, setScan] = useState<BusinessScan | undefined>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [gateOpen, setGateOpen] = useState(false);
  const questions = useMemo(() => generateProofCheckQuestions(), []);

  useEffect(() => {
    if (id) storageService.getScan(id).then(setScan);
  }, [id]);

  const selectedAngle: BusinessAngle | undefined = useMemo(() => {
    if (!scan) return undefined;
    return scan.angles.find((angle) => angle.id === params.get("angle")) ?? scan.angles[0];
  }, [scan, params]);

  const proofAnswers = useMemo(() => createProofAnswers(answers), [answers]);
  const previewScore =
    scan && selectedAngle
      ? calculateStartupReadinessScore(scan.observationInput, selectedAngle, proofAnswers)
      : undefined;

  if (!scan || !selectedAngle) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Card className="p-8">
          <h1 className="text-3xl font-bold">Proof check not found</h1>
        </Card>
      </main>
    );
  }

  const generate = async () => {
    const dossier = generateStartupDossier(scan, selectedAngle, proofAnswers);
    await storageService.saveScan({ ...scan, saved: true });
    await storageService.saveDossier(dossier);
    navigate(`/app/dossier/${dossier.id}`);
  };

  const requestGenerate = async () => {
    if (!profile) {
      setGateOpen(true);
      return;
    }
    await generate();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await requestGenerate();
  };

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form className="space-y-4" onSubmit={submit}>
          <Card className="p-6">
            <Badge tone="info">Proof Check</Badge>
            <h1 className="mt-4 text-3xl font-black">Run proof check for {selectedAngle.name}</h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Simple questions, plain language. The goal is to find what is real, what is missing,
              and what to prove next.
            </p>
          </Card>

          {questions.map((question, index) => (
            <Card key={question.id} className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-signal text-sm font-black text-slate-950">
                  {index + 1}
                </span>
                <h2 className="text-lg font-bold">{question.question}</h2>
              </div>
              <FieldLabel label="" helper={question.helperText}>
                <Textarea
                  value={answers[question.id] ?? ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                  placeholder="Write a concrete answer..."
                />
              </FieldLabel>
            </Card>
          ))}

          <Button type="submit" fullWidth icon={<FileText size={18} />}>
            Generate Startup Dossier
          </Button>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="text-lg font-bold">Selected angle</h2>
            <p className="mt-2 text-xl font-bold text-white">{selectedAngle.name}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{selectedAngle.oneLineDescription}</p>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-bold">Proof summary</h2>
            {previewScore ? (
              <>
                <div className="mt-4">
                  <ScoreBar value={previewScore.total} label={previewScore.label} />
                </div>
                <div className="mt-5 grid gap-3 text-sm text-slate-300">
                  <Summary label="Proof Strength" value={`${previewScore.categories.validationEvidence}/12`} />
                  <Summary label="Buyer Clarity" value={`${previewScore.categories.buyerClarity}/12`} />
                  <Summary label="MVP Clarity" value={`${previewScore.categories.mvpClarity}/10`} />
                  <Summary label="Risk Awareness" value={`${previewScore.categories.riskAwareness}/8`} />
                  <Summary label="Sendability" value={previewScore.label} />
                  <Summary label="Missing Proof" value={previewScore.missingProof[0] ?? "Pricing and repeat usage"} />
                </div>
              </>
            ) : null}
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-bold">Generate Dossier</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              After previewing or completing this Proof Check, generate the startup dossier for the selected angle.
            </p>
            <Button className="mt-4" fullWidth icon={<FileText size={18} />} onClick={requestGenerate}>
              Generate Startup Dossier
            </Button>
          </Card>
        </aside>
      </div>
      <SaveGate open={gateOpen} onClose={() => setGateOpen(false)} onSaved={generate} />
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.05] p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-slate-200">{value}</div>
    </div>
  );
}
