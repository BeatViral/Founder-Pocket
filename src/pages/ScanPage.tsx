import { Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black">What have you noticed?</h1>
        <p className="mt-3 text-slate-300">
          It can be from work, life, customers, friends, hobbies, family, travel, music, health,
          money, culture, local business, or anything you keep seeing.
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
    </main>
  );
}
