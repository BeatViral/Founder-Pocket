import type {
  BusinessAngle,
  BusinessPotentialScore,
  BusinessScanStatus,
  ObservationInput,
  ProofCheckAnswer,
  ScoreBand,
  SignalType,
  StartupReadinessScore
} from "../types";

const has = (value: string, pattern: RegExp) => pattern.test(value);

const quality = (value = "") => {
  const text = value.trim();
  if (!text) return 0;

  const words = text.split(/\s+/).filter(Boolean).length;
  let score = 0.22;
  if (words >= 6) score += 0.16;
  if (words >= 14) score += 0.2;
  if (words >= 28) score += 0.15;
  if (/\d|daily|weekly|monthly|hours|minutes|money|cost|risk|stress|pay|paid|customer|client/i.test(text)) {
    score += 0.14;
  }
  if (/because|when|after|before|instead|currently|usually|keeps|always|often/i.test(text)) {
    score += 0.13;
  }

  return Math.min(1, score);
};

const scorePart = (value: number, max: number) => Math.round(Math.min(1, value) * max);

const bandFromScore = (
  total: number
): { band: ScoreBand; label: string; scanStatus: BusinessScanStatus } => {
  if (total >= 90) {
    return {
      band: "high_confidence",
      label: "High-confidence business signal",
      scanStatus: "Strong opportunity signal"
    };
  }
  if (total >= 75) {
    return {
      band: "strong_early",
      label: "Strong early opportunity",
      scanStatus: "Strong opportunity signal"
    };
  }
  if (total >= 60) {
    return {
      band: "worth_exploring",
      label: "Worth exploring",
      scanStatus: "Business angle found"
    };
  }
  if (total >= 40) {
    return {
      band: "needs_proof",
      label: "Interesting, needs more proof",
      scanStatus: "Interesting but needs more proof"
    };
  }
  return {
    band: "probably_not",
    label: "Probably not a business yet",
    scanStatus: "Probably not a business yet"
  };
};

export function signalForAnswer(answer: string): ProofCheckAnswer["signal"] {
  const value = quality(answer);
  if (value >= 0.72) return "strong";
  if (value >= 0.46) return "medium";
  return "weak";
}

export function calculateBusinessPotentialScore(
  observation: ObservationInput,
  signalTypes: SignalType[],
  angles: BusinessAngle[]
): BusinessPotentialScore {
  const text = `${observation.observationText} ${observation.optionalContext}`;
  const repeated = has(text, /keep|keeps|always|often|every|repeated|again|daily|weekly|habit/i);
  const pain = has(text, /forget|waste|struggle|hard|slow|miss|confus|stress|risk|expensive|night|unfinished|run out/i);
  const money = has(text, /pay|buy|cost|quote|invoice|restaurant|clinic|client|customer|business|firm|money|paid/i);
  const workaround = has(text, /spreadsheet|phone|manual|paper|calls|notes|hard drive|email|message|forms|daw/i);
  const easyMvp = signalTypes.some((signal) =>
    ["Workflow friction", "Admin burden", "Automation opportunity", "Information confusion", "Creative bottleneck"].includes(signal)
  );

  const categories = {
    frequency: scorePart((repeated ? 0.85 : 0.5) * quality(observation.observationText), 10),
    painOrImportance: scorePart(pain ? 0.9 : 0.48, 15),
    buyerClarity: scorePart(money ? 0.72 : 0.42, 10),
    moneyMovement: scorePart(money ? 0.75 : 0.38, 10),
    currentWorkaround: scorePart(workaround || easyMvp ? 0.76 : 0.45, 10),
    easeOfFirstVersion: scorePart(easyMvp ? 0.82 : 0.56, 10),
    founderFit: scorePart(observation.whereNoticed !== "Other" ? 0.68 : 0.48, 10),
    timing: scorePart(has(text, /still|now|today|modern|ai|online|remote|shortage|pressure/i) ? 0.76 : 0.52, 5),
    marketExpansion: scorePart(angles.length >= 3 ? 0.72 : 0.5, 10),
    proofAvailable: scorePart(quality(observation.optionalContext || observation.observationText) * 0.85, 10)
  };

  const total = Object.values(categories).reduce((sum, item) => sum + item, 0);
  const band = bandFromScore(total);
  const strongSignals: string[] = [];
  const weakSignals: string[] = [];
  const missingProof: string[] = [];

  if (categories.frequency >= 7) strongSignals.push("The observation sounds repeated, not one-off.");
  else weakSignals.push("Frequency still needs clearer evidence.");

  if (categories.painOrImportance >= 10) strongSignals.push("There is visible pain, waste, risk, or frustration.");
  else weakSignals.push("The cost of the problem is not yet concrete.");

  if (categories.currentWorkaround >= 7) strongSignals.push("There appears to be a current workaround to replace.");
  else missingProof.push("What people do today instead of using a product.");

  if (categories.buyerClarity < 7) missingProof.push("Who would pay and what budget it comes from.");
  if (categories.proofAvailable < 7) missingProof.push("Direct evidence from people who feel the problem.");
  if (categories.easeOfFirstVersion < 7) missingProof.push("A smaller first version that can be tested quickly.");

  return {
    total,
    band: band.band,
    label: band.label,
    status: band.scanStatus,
    categories,
    strongSignals,
    weakSignals,
    missingProof,
    recommendedNextStep:
      total >= 60
        ? "Pick the strongest angle and run a proof check with 5 to 10 real people."
        : "Clarify who has this problem, how often it happens, and what they do today."
  };
}

const answer = (answers: ProofCheckAnswer[], id: string) =>
  answers.find((item) => item.id === id)?.answer ?? "";

export function calculateStartupReadinessScore(
  observation: ObservationInput,
  angle: BusinessAngle,
  answers: ProofCheckAnswer[]
): StartupReadinessScore {
  const categories = {
    observationClarity: scorePart(quality(observation.observationText), 10),
    customerSpecificity: scorePart(quality(answer(answers, "who_cares")), 12),
    buyerClarity: scorePart(quality(answer(answers, "who_pays")), 12),
    currentWorkaroundClarity: scorePart(quality(answer(answers, "current_workaround")), 10),
    mvpClarity: scorePart(quality(answer(answers, "smallest_version") || angle.firstVersion), 10),
    validationEvidence: scorePart(quality(answer(answers, "evidence")), 12),
    founderFit: scorePart(quality(answer(answers, "seen_personally")) || 0.55, 9),
    riskAwareness: scorePart(quality(answer(answers, "could_be_wrong")), 8),
    goToMarketClarity: scorePart(quality(answer(answers, "first_people")), 8),
    nextStepClarity: scorePart(quality(answer(answers, "what_proves_real")), 9)
  };

  const total = Object.values(categories).reduce((sum, item) => sum + item, 0);
  const band = bandFromScore(total);
  const strongSignals: string[] = [];
  const weakSignals: string[] = [];
  const missingProof: string[] = [];

  if (categories.customerSpecificity >= 8) strongSignals.push("The first customer is becoming specific.");
  else weakSignals.push("The first customer is still too broad.");

  if (categories.mvpClarity >= 7) strongSignals.push("The first version is narrow enough to test.");
  else weakSignals.push("The MVP still reads too broad.");

  if (categories.validationEvidence >= 8) strongSignals.push("There is early evidence or a concrete proof path.");
  else missingProof.push("Evidence from interviews, pilots, paid intent, waitlist demand, or repeated requests.");

  if (categories.buyerClarity < 8) missingProof.push("A clear buyer and reason they would pay now.");
  if (categories.currentWorkaroundClarity < 7) missingProof.push("The current workaround and why it is not good enough.");
  if (categories.goToMarketClarity < 6) missingProof.push("A real list of first people to contact.");

  return {
    total,
    band: band.band,
    label:
      total >= 90
        ? "High-confidence startup candidate"
        : total >= 75
          ? "Strong early opportunity"
          : total >= 60
            ? "Worth exploring"
            : total >= 40
              ? "Interesting, needs proof"
              : "Not enough signal yet",
    categories,
    strongSignals,
    weakSignals,
    missingProof,
    nextActions: [
      "Talk to 10 people in the narrow target group.",
      "Show a mockup or manual version before building a full product.",
      "Ask who pays, how much, and what approval path exists.",
      "Collect direct quotes and objections.",
      "Update this dossier with proof before sharing broadly."
    ]
  };
}
