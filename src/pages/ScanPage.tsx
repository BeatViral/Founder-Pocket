import { Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FieldLabel, Select, Textarea } from "../components/ui/FormControls";
import {
  createObservationInput,
  desiredOutcomeOptions,
  generateBusinessScan,
  ideaStateOptions,
  whereNoticedOptions
} from "../services/generationService";
import { storageService } from "../services/storageService";
import type { DesiredOutcome, IdeaState, WhereNoticed } from "../types";

type LocationState = { observationText?: string };

export default function ScanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [observationText, setObservationText] = useState(state?.observationText ?? "");
  const [optionalContext, setOptionalContext] = useState("");
  const [whereNoticed, setWhereNoticed] = useState<WhereNoticed>("Work");
  const [ideaState, setIdeaState] = useState<IdeaState>("No, just checking");
  const [desiredOutcome, setDesiredOutcome] = useState<DesiredOutcome>("Just scan for possibilities");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state?.observationText) {
      window.history.replaceState({}, document.title);
    }
  }, [state?.observationText]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!observationText.trim()) return;
    setLoading(true);
    const input = createObservationInput({
      observationText,
      optionalContext,
      whereNoticed,
      ideaState,
      desiredOutcome
    });
    const scan = generateBusinessScan(input);
    await storageService.saveScan(scan);
    window.setTimeout(() => navigate(`/app/scan/${scan.id}`), 650);
  };

  if (loading) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-16">
        <Card className="w-full p-8 text-center">
          <Loader2 className="mx-auto animate-spin text-signal" size={42} />
          <h1 className="mt-6 text-3xl font-bold">Scanning for business signals</h1>
          <div className="mt-5 grid gap-2 text-sm text-slate-300">
            {["Reading the observation", "Classifying signal types", "Looking for workarounds", "Generating business angles", "Scoring potential"].map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-white/[0.05] px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(139,92,246,0.13),transparent_28%)]" />
      <section className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <Badge tone="info">Founder Pocket</Badge>
          <h1 className="mt-5 text-5xl font-black tracking-tight md:text-7xl">
            Type something you've noticed. See if there's a business in it.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Start with a plain observation from work, life, customers, hobbies, health, music,
            education, local business, or the world around you.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Not every observation is a business. Founder Pocket helps you find the ones that might be.
          </p>
        </div>
      <Card className="p-5 md:p-7">
        <form className="space-y-5" onSubmit={submit}>
          <FieldLabel label="What have you noticed?" helper="Write it like you would say it to a friend.">
            <Textarea
              required
              value={observationText}
              onChange={(event) => setObservationText(event.target.value)}
              placeholder="I keep noticing that..."
              className="min-h-40 text-base"
            />
          </FieldLabel>
          <FieldLabel label="Optional context" helper="Add where you saw it, who was involved, or why it stood out.">
            <Textarea value={optionalContext} onChange={(event) => setOptionalContext(event.target.value)} />
          </FieldLabel>
          <div className="grid gap-4 md:grid-cols-3">
            <FieldLabel label="Where did you notice it?">
              <Select value={whereNoticed} onChange={(event) => setWhereNoticed(event.target.value as WhereNoticed)}>
                {whereNoticedOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </FieldLabel>
            <FieldLabel label="Do you already have an idea?">
              <Select value={ideaState} onChange={(event) => setIdeaState(event.target.value as IdeaState)}>
                {ideaStateOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </FieldLabel>
            <FieldLabel label="What do you want from this?">
              <Select value={desiredOutcome} onChange={(event) => setDesiredOutcome(event.target.value as DesiredOutcome)}>
                {desiredOutcomeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </FieldLabel>
          </div>
          <Button type="submit" fullWidth>
            Scan for Business
          </Button>
        </form>
      </Card>
      </section>
    </main>
  );
}
