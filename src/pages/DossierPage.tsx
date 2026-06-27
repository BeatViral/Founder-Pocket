import { Download, FileJson, Printer, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { EditableSection } from "../components/dossier/EditableSection";
import { ShareModal } from "../components/dossier/ShareModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CopyButton } from "../components/ui/CopyButton";
import { SaveGate, useUserProfile } from "../components/ui/SaveGate";
import { ScoreBar } from "../components/ui/ScoreBar";
import { statusTone } from "../lib/format";
import { dossierService } from "../services/dossierService";
import type { DossierSectionType, StartupDossier } from "../types";

const sectionLabels: Record<DossierSectionType, string> = {
  snapshot: "Snapshot",
  full_dossier: "Full Dossier",
  accelerator_answers: "Accelerator Answers",
  faq: "FAQ",
  proof_check: "Proof Check",
  readiness_score: "Readiness Score",
  mvp_build_brief: "MVP Build Brief",
  validation_sprint: "Validation Sprint",
  founder_video_script: "Founder Video Script",
  outreach_email: "Outreach Email",
  data_room_checklist: "Data Room Checklist",
  missing_proof: "Missing Proof"
};

export default function DossierPage() {
  const { id } = useParams();
  const { profile } = useUserProfile();
  const [dossier, setDossier] = useState<StartupDossier | undefined>();
  const [activeType, setActiveType] = useState<DossierSectionType>("snapshot");
  const [shareOpen, setShareOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"share" | "export" | null>(null);

  useEffect(() => {
    if (id) dossierService.getDossier(id).then(setDossier);
  }, [id]);

  const activeSection = useMemo(
    () => dossier?.sections.find((section) => section.type === activeType) ?? dossier?.sections[0],
    [dossier, activeType]
  );

  if (!dossier || !activeSection) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Card className="p-8">
          <h1 className="text-3xl font-bold">Dossier not found</h1>
        </Card>
      </main>
    );
  }

  const requireProfile = (action: "share" | "export") => {
    if (!profile) {
      setPendingAction(action);
      setGateOpen(true);
      return false;
    }
    return true;
  };

  const openShare = () => {
    if (requireProfile("share")) setShareOpen(true);
  };

  const print = () => {
    if (requireProfile("export")) window.print();
  };

  const downloadJson = () => {
    if (!requireProfile("export")) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dossier.slug}-dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onGateSaved = () => {
    if (pendingAction === "share") setShareOpen(true);
    if (pendingAction === "export") window.print();
    setPendingAction(null);
  };

  const saveSection = async (section: typeof activeSection) => {
    const updated = await dossierService.updateSection(dossier.id, section);
    if (updated) setDossier(updated);
  };

  const getSectionText = (type: DossierSectionType) =>
    dossier.sections.find((section) => section.type === type)?.content ?? "";

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 print-container">
      <header className="no-print mb-6 rounded-lg border border-white/12 bg-white/[0.06] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone={statusTone(dossier.status)}>{dossier.status}</Badge>
            <h1 className="mt-3 text-3xl font-black md:text-5xl">{dossier.startupName}</h1>
            <p className="mt-3 max-w-3xl text-slate-300">{dossier.oneLiner}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={openShare} icon={<Share2 size={16} />}>
              Share
            </Button>
            <Button variant="secondary" onClick={print} icon={<Printer size={16} />}>
              Export PDF
            </Button>
            <CopyButton text={getSectionText("accelerator_answers")} label="Copy Accelerator Answers" />
            <CopyButton text={getSectionText("mvp_build_brief")} label="Copy Build Brief" />
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[230px_1fr_320px]">
        <aside className="no-print space-y-2 lg:sticky lg:top-24 lg:self-start">
          {dossier.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveType(section.type)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                  activeSection.type === section.type
                    ? "border-signal bg-signal/15 text-white"
                    : "border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                {sectionLabels[section.type]}
              </button>
            ))}
        </aside>

        <EditableSection section={activeSection} onSave={saveSection} />

        <aside className="no-print space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="font-bold">Startup Readiness Score</h2>
            <div className="mt-4">
              <ScoreBar value={dossier.readinessScore.total} label={dossier.readinessScore.label} />
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Missing proof</h2>
            <div className="mt-3 space-y-2">
              {dossier.missingProofItems.map((item) => (
                <div key={item.id} className="rounded-md border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.priority} priority</div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Next actions</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {dossier.readinessScore.nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Export options</h2>
            <div className="mt-3 grid gap-2">
              <CopyButton text={getSectionText("snapshot")} label="Copy Business Snapshot" />
              <CopyButton text={getSectionText("outreach_email")} label="Copy Outreach Email" />
              <Button variant="secondary" onClick={downloadJson} icon={<FileJson size={16} />}>
                Download JSON
              </Button>
              <Button variant="secondary" onClick={print} icon={<Download size={16} />}>
                Print / Save as PDF
              </Button>
            </div>
          </Card>
        </aside>
      </div>
      <ShareModal dossier={dossier} open={shareOpen} onClose={() => setShareOpen(false)} onUpdated={setDossier} />
      <SaveGate open={gateOpen} onClose={() => setGateOpen(false)} onSaved={onGateSaved} />
    </main>
  );
}
