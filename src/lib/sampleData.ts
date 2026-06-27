import {
  createObservationInput,
  createProofAnswers,
  generateBusinessScan,
  generateStartupDossier
} from "../services/generationService";
import type { BusinessScan, StartupDossier } from "../types";

function makeSample(
  observationText: string,
  optionalContext: string,
  whereNoticed:
    | "Health/medical"
    | "Music/creative"
    | "Education"
    | "Local business"
    | "Work",
  angleIndex = 0
): { scan: BusinessScan; dossier: StartupDossier } {
  const input = createObservationInput({
    observationText,
    optionalContext,
    founderContext: "I have direct access to people in this niche, understand the current workflow, and can run early validation through warm conversations.",
    whereNoticed,
    ideaState: "Maybe",
    desiredOutcome: "Find a business angle"
  });
  const scan = { ...generateBusinessScan(input), saved: true };
  const selectedAngle = scan.angles[angleIndex] ?? scan.angles[0];
  const answers = createProofAnswers({
    who_cares: selectedAngle.whoItHelps,
    frequency: "This happens every week and often several times during busy periods.",
    current_workaround: "People use manual notes, messages, spreadsheets, calls, and memory to handle it today.",
    cost: "It costs time, creates stress, and increases the chance that important work is missed.",
    who_pays: selectedAngle.whoMightPay,
    why_now: "Expectations are higher, teams have less admin capacity, and lightweight tools can now solve narrow workflows.",
    smallest_version: selectedAngle.firstVersion,
    first_people: "Former colleagues, small operators, founders in the niche, local businesses, and warm community contacts.",
    what_proves_real: "Ten interviews, three expressions of interest, and one paid or time-committed pilot would prove the signal.",
    could_be_wrong: "The idea could be wrong if the pain is real but not urgent enough to pay for.",
    seen_personally: "This came from a repeated personal observation, not a random idea prompt.",
    founder_background: "The founder has direct access to people in the niche, understands the workaround, and can reach early testers without paid acquisition.",
    founder_motivation: "The founder wants to make the repeated workflow clearer and less stressful, and has enough curiosity to keep interviewing even when the first version changes.",
    founder_decision_style: "The founder will decide through weekly evidence reviews, direct customer conversations, and clear continue, narrow, or stop thresholds.",
    founder_risk_tolerance: "The founder is willing to risk focused build time and small manual pilots, but not a large product build before proof exists.",
    founder_habits: "The useful habit is shipping small tests quickly; the watchout is overbuilding before enough customers have reacted.",
    evidence: "The evidence so far is repeated observation and visible workarounds, with direct customer proof still needed."
  });

  const dossier = generateStartupDossier(scan, selectedAngle, answers);
  return { scan, dossier };
}

const samples = [
  makeSample(
    "Patients forget what doctors tell them after appointments.",
    "Small clinics still rely on calls, notes, and memory for follow-up.",
    "Health/medical",
    1
  ),
  makeSample(
    "Musicians have hard drives full of unfinished songs.",
    "Creators often have ideas and recordings but get stuck before finishing a release.",
    "Music/creative",
    1
  ),
  makeSample(
    "Parents keep asking teachers the same questions.",
    "Teachers lose time repeating updates that could be clearer and easier to find.",
    "Education",
    0
  ),
  makeSample(
    "Tradies spend nights writing quotes.",
    "The job happens during the day, but the admin happens late after work.",
    "Local business",
    0
  ),
  makeSample(
    "Small restaurants waste food but still run out of popular dishes.",
    "Kitchen teams make prep decisions with rough guesses.",
    "Local business",
    0
  )
];

export const sampleScans = samples.map((sample) => sample.scan);
export const sampleDossiers = samples.map((sample) => sample.dossier);
