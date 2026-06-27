import { Compass, Sparkles, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { FounderFitEngineProfile } from "../../types";
import { Card } from "../ui/Card";
import { ScoreBar } from "../ui/ScoreBar";

export function FounderFitCard({
  profile,
  compact = false
}: {
  profile?: FounderFitEngineProfile;
  compact?: boolean;
}) {
  if (!profile) return null;

  return (
    <Card className={compact ? "p-5" : "p-6"}>
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-signal/15 text-signal">
          <Compass size={20} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Founder Fit</p>
          <h2 className={compact ? "mt-1 text-lg font-bold" : "mt-1 text-2xl font-bold"}>Founder Fit Score</h2>
        </div>
      </div>

      <ScoreBar value={profile.fitScore} label={profile.label} />

      <div className="mt-5 rounded-md border border-white/10 bg-white/[0.05] p-4">
        <h3 className="text-sm font-bold text-white">Why this fits the user</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {profile.adaptation.angleStrategy} Founder Pocket reads this as a {profile.primaryArchetype.toLowerCase()}
          {" "}path with a {profile.communicationStyle} dossier tone.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <SignalGroup icon={<Sparkles size={16} />} title="Strong fit signals" items={profile.strongSignals} />
        <SignalGroup icon={<TriangleAlert size={16} />} title="Weak fit signals" items={profile.weakSignals} muted />
      </div>

      <div className="mt-5 rounded-md border border-signal/30 bg-signal/10 p-4">
        <h3 className="text-sm font-bold text-white">Recommended founder path</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Use a <span className="font-semibold text-white">{profile.validationPath}</span> path.{" "}
          {profile.adaptation.proofQuestionMode}
        </p>
      </div>
    </Card>
  );
}

function SignalGroup({
  icon,
  title,
  items,
  muted = false
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  muted?: boolean;
}) {
  const fallback = muted ? "No major weak fit signal yet." : "Strong fit signals still need proof.";

  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <span className={muted ? "text-amber-300" : "text-signal"}>{icon}</span>
        {title}
      </div>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-400">
        {(items.length ? items : [fallback]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
