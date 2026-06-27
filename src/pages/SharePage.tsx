import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Markdown } from "../components/ui/Markdown";
import { ScoreBar } from "../components/ui/ScoreBar";
import { shareModeLabels } from "../lib/format";
import { analyticsService } from "../services/analyticsService";
import { shareService } from "../services/shareService";
import type { DossierSectionType, ShareMode, SharedDossierResult } from "../types";

const modeSections: Record<ShareMode, DossierSectionType[]> = {
  full: [
    "snapshot",
    "full_dossier",
    "founder_fit_engine",
    "founder_market_fit",
    "founder_psychology",
    "accelerator_answers",
    "faq",
    "proof_check",
    "readiness_score",
    "mvp_build_brief",
    "validation_sprint",
    "founder_video_script",
    "outreach_email",
    "data_room_checklist",
    "missing_proof"
  ],
  investor: ["snapshot", "founder_fit_engine", "founder_market_fit", "full_dossier", "faq", "readiness_score", "missing_proof"],
  builder: ["founder_fit_engine", "founder_market_fit", "mvp_build_brief", "validation_sprint", "missing_proof"],
  accelerator: ["accelerator_answers", "founder_fit_engine", "founder_market_fit", "founder_psychology", "founder_video_script", "proof_check", "readiness_score"]
};

export default function SharePage({ mode }: { mode?: ShareMode }) {
  const { shareToken } = useParams();
  const [result, setResult] = useState<SharedDossierResult | undefined>();

  useEffect(() => {
    if (shareToken) {
      shareService.recordView(shareToken).then((next) => {
        setResult(next);
        if (next) analyticsService.track("share_link_viewed", { token: shareToken, mode: next.shareLink.mode });
      });
    }
  }, [shareToken]);

  const activeMode = mode ?? result?.shareLink.mode ?? "full";
  const sections = useMemo(() => {
    if (!result) return [];
    const allowed = modeSections[activeMode];
    return result.dossier.sections
      .filter((section) => allowed.includes(section.type))
      .sort((a, b) => a.order - b.order);
  }, [activeMode, result]);

  if (!result) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-4 text-white">
        <Card className="max-w-xl p-8 text-center">
          <h1 className="text-3xl font-bold">Share link not found</h1>
          <p className="mt-3 text-slate-300">The link may be inactive or only available in the browser where it was created.</p>
          <Link to="/" className="mt-6 inline-flex">
            <Button>Go to Founder Pocket</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-white sm:px-6 print-container print-footer">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-lg border border-white/12 bg-white/[0.06] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Badge tone="info">{shareModeLabels[activeMode]}</Badge>
            <span className="text-sm text-slate-400">{result.shareLink.viewCount ?? 0} views</span>
            <Button variant="secondary" onClick={() => window.print()}>
              Print / Save as PDF
            </Button>
          </div>
          <h1 className="mt-4 text-4xl font-black">{result.dossier.startupName}</h1>
          <p className="mt-3 max-w-3xl text-slate-300">{result.dossier.oneLiner}</p>
          <div className="mt-5 max-w-md">
            <ScoreBar value={result.dossier.readinessScore.total} label={result.dossier.readinessScore.label} />
          </div>
        </header>

        <div className="space-y-5">
          {sections.map((section) => (
            <article key={section.id} className="rounded-lg border border-slate-200 bg-white p-6 text-slate-950 print-section">
              <h2 className="mb-4 text-2xl font-bold">{section.title}</h2>
              <Markdown content={section.content} />
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
