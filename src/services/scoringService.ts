import type {
  BusinessAngle,
  BusinessPotentialScore,
  BusinessScanStatus,
  DossierTone,
  FounderArchetype,
  FounderBehaviourMode,
  FounderFitEngineProfile,
  FounderInsightType,
  FounderMarketFitProfile,
  FounderPsychologyProfile,
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

const answer = (answers: ProofCheckAnswer[], id: string) =>
  answers.find((item) => item.id === id)?.answer ?? "";

const combinedQuality = (answers: ProofCheckAnswer[], ids: string[]) =>
  quality(ids.map((id) => answer(answers, id)).join(" "));

const profileLabel = (score: number, strong: string, medium: string, early: string) => {
  if (score >= 78) return strong;
  if (score >= 56) return medium;
  return early;
};

const unique = <T>(items: T[]) => Array.from(new Set(items));

const hasAny = (value: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(value));

const founderText = (observation: ObservationInput, answers: ProofCheckAnswer[]) =>
  [
    observation.observationText,
    observation.optionalContext,
    observation.founderContext,
    answer(answers, "seen_personally"),
    answer(answers, "founder_background"),
    answer(answers, "founder_motivation"),
    answer(answers, "founder_decision_style"),
    answer(answers, "founder_risk_tolerance"),
    answer(answers, "founder_habits"),
    answer(answers, "first_people"),
    answer(answers, "current_workaround"),
    answer(answers, "evidence")
  ]
    .filter(Boolean)
    .join(" ");

function inferFounderArchetypes(text: string, observation: ObservationInput): FounderArchetype[] {
  const lower = text.toLowerCase();
  const archetypes: FounderArchetype[] = [];

  if (hasAny(lower, [/doctor|nurse|teacher|chef|clinician|therapist|lawyer|accountant|engineer|domain|specialist|expert/])) {
    archetypes.push("Domain Expert Founder");
  }
  if (hasAny(lower, [/admin|operator|operations|manager|coordinator|workflow|process|running|manage|clinic admin|restaurant owner/])) {
    archetypes.push("Operator Founder");
  }
  if (hasAny(lower, [/creator|artist|musician|writer|producer|audience|content|community|newsletter|youtube|tiktok|podcast/])) {
    archetypes.push("Creator Founder");
  }
  if (hasAny(lower, [/developer|software|technical|code|engineer|api|automation|prototype|build|product/])) {
    archetypes.push("Technical Founder");
  }
  if (hasAny(lower, [/service|consultant|agency|freelance|coach|advisor|manual pilot|concierge/])) {
    archetypes.push("Service Founder");
  }
  if (hasAny(lower, [/industry|insider|worked in|years|clients|customers|former|colleagues|operators/])) {
    archetypes.push("Industry Insider Founder");
  }
  if (hasAny(lower, [/patient|parent|personal|family|friend|i noticed|i keep|lived|seen personally|experienced/])) {
    archetypes.push("Problem Witness Founder");
  }
  if (hasAny(lower, [/community|members|group|network|audience|local|warm contacts|parents|artists|tradies/])) {
    archetypes.push("Community Founder");
  }
  if (hasAny(lower, [/sales|sell|buyer|commercial|pricing|revenue|paid|pilot|client|business owner/])) {
    archetypes.push("Commercial Founder");
  }
  if (hasAny(lower, [/build|ship|prototype|no-code|figma|mvp|product|automation|workflow/])) {
    archetypes.push("Builder Founder");
  }

  if (!archetypes.length && observation.whereNoticed !== "Other") archetypes.push("Problem Witness Founder");
  return unique(archetypes.length ? archetypes : ["Problem Witness Founder"]);
}

function inferInsightTypes(text: string): FounderInsightType[] {
  const lower = text.toLowerCase();
  const insights: FounderInsightType[] = [];

  if (hasAny(lower, [/workflow|process|admin|handoff|follow-up|quote|tracker/])) insights.push("workflow insight");
  if (hasAny(lower, [/customer|client|patient|parent|teacher|buyer|user/])) insights.push("customer insight");
  if (hasAny(lower, [/pain|stress|frustration|waste|risk|miss|hard|slow|confusing/])) insights.push("pain insight");
  if (hasAny(lower, [/operations|operator|manager|shift|clinic|restaurant|team|staff/])) insights.push("operational insight");
  if (hasAny(lower, [/behaviour|habit|keep|always|often|repeat|stop|forget/])) insights.push("behavioural insight");
  if (hasAny(lower, [/market|pricing|buyer|competitor|paid|budget|demand/])) insights.push("market insight");
  if (hasAny(lower, [/personal|lived|family|care|motivation|emotional|why/])) insights.push("emotional insight");
  if (hasAny(lower, [/access|network|community|warm|colleagues|first people|audience/])) insights.push("access insight");

  return unique(insights.length ? insights : ["pain insight", "workflow insight"]);
}

function inferBehaviourMode(text: string, archetypes: FounderArchetype[]): FounderBehaviourMode {
  const lower = text.toLowerCase();

  if (hasAny(lower, [/not sure|unsure|hesitant|scared|nervous|shy|overwhelmed|new to this/])) return "Hesitant Explorer";
  if (hasAny(lower, [/data|analy|measure|evidence|score|test|experiment|research/])) return "Analytical Founder";
  if (archetypes.includes("Technical Founder") || archetypes.includes("Builder Founder")) return "Builder Founder";
  if (archetypes.includes("Creator Founder")) return "Creator Founder";
  if (archetypes.includes("Commercial Founder")) return "Commercial Founder";
  if (hasAny(lower, [/vision|future|platform|big|movement|category|world/])) return "Vision-Led Founder";
  if (archetypes.includes("Operator Founder") || archetypes.includes("Service Founder")) return "Practical Operator";
  return lower.trim().length < 80 ? "Early Beginner" : "Practical Operator";
}

function inferTone(mode: FounderBehaviourMode, archetypes: FounderArchetype[]): DossierTone {
  if (mode === "Builder Founder" || archetypes.includes("Technical Founder")) return "technical";
  if (mode === "Commercial Founder") return "commercial";
  if (mode === "Creator Founder" || mode === "Vision-Led Founder") return "narrative";
  if (mode === "Analytical Founder") return "structured";
  if (mode === "Practical Operator") return "practical";
  if (mode === "Hesitant Explorer") return "plain";
  return "founder-authentic";
}

function inferValidationPath(mode: FounderBehaviourMode, archetypes: FounderArchetype[]): FounderFitEngineProfile["validationPath"] {
  if (mode === "Hesitant Explorer") return "email-first";
  if (mode === "Builder Founder" || archetypes.includes("Technical Founder")) return "prototype-first";
  if (archetypes.includes("Creator Founder") || archetypes.includes("Community Founder")) return "audience-first";
  if (archetypes.includes("Service Founder") || archetypes.includes("Commercial Founder")) return "client-first";
  if (archetypes.includes("Domain Expert Founder") || archetypes.includes("Industry Insider Founder")) return "expert-first";
  return "interview-first";
}

function angleStrategyFor(archetype: FounderArchetype) {
  const strategies: Record<FounderArchetype, string> = {
    "Domain Expert Founder": "Prioritize credible domain wedges and expert-led validation.",
    "Operator Founder": "Prioritize workflow automation, current workarounds, and operational ROI.",
    "Creator Founder": "Prioritize audience, education, community, and content-led demand tests.",
    "Technical Founder": "Prioritize prototype-first SaaS, API, automation, and integration wedges.",
    "Service Founder": "Prioritize concierge pilots and productized-service wedges before software.",
    "Industry Insider Founder": "Prioritize insider workflow pain and warm-channel pilots.",
    "Problem Witness Founder": "Prioritize lived-experience insight, narrow customer discovery, and simple proof.",
    "Community Founder": "Prioritize community testing, waitlists, and trust-building proof.",
    "Commercial Founder": "Prioritize buyer clarity, pricing tests, and paid pilot paths.",
    "Builder Founder": "Prioritize fast MVP scope, build brief quality, and prototype feedback."
  };

  return strategies[archetype];
}

export function analyzeFounderFitEngine(
  observation: ObservationInput,
  angle: BusinessAngle,
  answers: ProofCheckAnswer[]
): FounderFitEngineProfile {
  const text = founderText(observation, answers);
  const archetypes = inferFounderArchetypes(text, observation);
  const primaryArchetype = archetypes[0];
  const insightTypes = inferInsightTypes(text);
  const behaviourMode = inferBehaviourMode(text, archetypes);
  const communicationStyle = inferTone(behaviourMode, archetypes);
  const validationPath = inferValidationPath(behaviourMode, archetypes);

  const contextQuality = quality(observation.founderContext ?? "");
  const backgroundQuality = quality(answer(answers, "founder_background"));
  const seenQuality = quality(answer(answers, "seen_personally"));
  const firstPeopleQuality = quality(answer(answers, "first_people"));
  const proofQuality = quality(answer(answers, "evidence"));
  const buildQuality = quality(answer(answers, "smallest_version") || angle.firstVersion);
  const buyerQuality = quality(answer(answers, "who_pays"));
  const motivationQuality = quality(answer(answers, "founder_motivation"));
  const habitQuality = quality(answer(answers, "founder_habits"));
  const workaroundQuality = quality(answer(answers, "current_workaround"));

  const dimensions = {
    domainFit: scorePart(Math.max(contextQuality, backgroundQuality, seenQuality), 10),
    credibilityFit: scorePart((backgroundQuality + buyerQuality + seenQuality) / 3, 10),
    insightFit: scorePart(Math.max(workaroundQuality, proofQuality, seenQuality), 10),
    customerAccess: scorePart(firstPeopleQuality, 10),
    validationAbility: scorePart((firstPeopleQuality + proofQuality + habitQuality) / 3, 10),
    buildOrBriefAbility: scorePart((buildQuality + backgroundQuality) / 2, 10),
    reachAbility: scorePart((firstPeopleQuality + buyerQuality) / 2, 10),
    emotionalCommitment: scorePart(Math.max(motivationQuality, seenQuality), 10),
    networkAdvantage: scorePart(Math.max(firstPeopleQuality, contextQuality), 10),
    executionReadiness: scorePart((habitQuality + buildQuality + proofQuality) / 3, 10)
  };

  const fitScore = Object.values(dimensions).reduce((sum, item) => sum + item, 0);
  const strongSignals: string[] = [];
  const weakSignals: string[] = [];

  if (dimensions.domainFit >= 7) strongSignals.push("Founder context suggests meaningful domain or lived fit.");
  else weakSignals.push("Domain fit is still under-explained.");

  if (dimensions.customerAccess >= 7) strongSignals.push("There is a plausible route to early users or customers.");
  else weakSignals.push("Customer access needs a named channel or list.");

  if (dimensions.insightFit >= 7) strongSignals.push("The founder has insight into the current workaround or pain.");
  else weakSignals.push("The insight still sounds generic rather than founder-specific.");

  if (dimensions.buildOrBriefAbility >= 7) strongSignals.push("The founder can likely build, brief, or scope the first version.");
  else weakSignals.push("Build or builder-brief ability needs a clearer plan.");

  if (dimensions.executionReadiness < 7) weakSignals.push("Execution readiness needs a concrete weekly validation rhythm.");

  return {
    archetypes,
    primaryArchetype,
    insightTypes,
    behaviourMode,
    communicationStyle,
    validationPath,
    fitScore,
    label: profileLabel(fitScore, "Strong founder-opportunity fit", "Emerging founder-opportunity fit", "Founder fit needs proof"),
    dimensions,
    strongSignals,
    weakSignals,
    adaptation: {
      angleStrategy: angleStrategyFor(primaryArchetype),
      proofQuestionMode:
        behaviourMode === "Hesitant Explorer"
          ? "Use low-pressure, concrete proof questions."
          : behaviourMode === "Builder Founder"
            ? "Emphasize build scope, prototype proof, and technical unknowns."
            : behaviourMode === "Commercial Founder"
              ? "Emphasize buyer, price, urgency, and commitment."
              : "Balance customer proof, founder insight, and MVP clarity.",
      dossierTone: communicationStyle,
      validationPath,
      shareEmphasis: {
        investor: ["founder insight", "credibility", "customer pain", "proof", "next milestone"],
        builder: ["product clarity", "MVP scope", "user flows", "technical unknowns"],
        accelerator: ["founder story", "why now", "proof", "speed", "narrow wedge"]
      }
    }
  };
}

export function analyzeFounderPsychology(answers: ProofCheckAnswer[]): FounderPsychologyProfile {
  const motivationText = answer(answers, "founder_motivation") || answer(answers, "seen_personally");
  const riskText = answer(answers, "founder_risk_tolerance") || answer(answers, "could_be_wrong");
  const decisionText = answer(answers, "founder_decision_style");
  const habitText = answer(answers, "founder_habits");
  const evidenceText = answer(answers, "evidence") || answer(answers, "what_proves_real");

  const dimensions = {
    motivation: scorePart(quality(motivationText), 20),
    riskTolerance: scorePart(quality(riskText), 20),
    decisionClarity: scorePart(quality(decisionText), 20),
    executionHabits: scorePart(quality(habitText), 20),
    learningLoop: scorePart(quality(evidenceText) * 0.7 + quality(answer(answers, "what_proves_real")) * 0.3, 20)
  };

  const total = Object.values(dimensions).reduce((sum, item) => sum + item, 0);
  const strengths: string[] = [];
  const watchouts: string[] = [];

  if (dimensions.motivation >= 14) strengths.push("The founder has a clear personal reason to stay with the problem.");
  else watchouts.push("Motivation is still vague; the founder may drift if validation gets uncomfortable.");

  if (dimensions.riskTolerance >= 14) strengths.push("Risk boundaries are named, which makes decision-making healthier.");
  else watchouts.push("Risk tolerance needs sharper boundaries before bigger build or launch decisions.");

  if (dimensions.decisionClarity >= 14) strengths.push("Decision style is becoming explicit enough to manage tradeoffs.");
  else watchouts.push("The founder should define how they will decide whether to continue, narrow, or stop.");

  if (dimensions.executionHabits >= 14) strengths.push("The founder has useful habits or routines to support repeated validation work.");
  else watchouts.push("Execution habits need a concrete weekly cadence.");

  if (dimensions.learningLoop < 14) watchouts.push("The learning loop needs direct customer evidence, not only internal conviction.");

  return {
    total,
    label: profileLabel(total, "Strong founder psychology signal", "Developing founder psychology signal", "Founder psychology needs work"),
    dimensions,
    primaryMotivation: motivationText || "Motivation has not been written yet.",
    decisionStyle: decisionText || "Decision style has not been written yet.",
    riskPosture: riskText || "Risk posture has not been written yet.",
    strengths,
    watchouts,
    operatingRules: [
      "Review proof weekly before adding scope.",
      "Write down the next disconfirming test before building.",
      "Keep one named customer segment until evidence says to expand.",
      "Separate enthusiasm from evidence by updating the dossier after each test."
    ]
  };
}

export function analyzeFounderMarketFit(
  observation: ObservationInput,
  angle: BusinessAngle,
  answers: ProofCheckAnswer[]
): FounderMarketFitProfile {
  const founderContextQuality = quality(observation.founderContext ?? "");
  const personalConnection = Math.max(founderContextQuality, combinedQuality(answers, ["seen_personally", "founder_background"]));
  const customerAccess = combinedQuality(answers, ["first_people", "who_cares"]);
  const unfairInsight = combinedQuality(answers, ["founder_background", "current_workaround", "evidence"]);
  const credibility = combinedQuality(answers, ["founder_background", "who_cares", "who_pays"]);
  const persistence = combinedQuality(answers, ["founder_motivation", "founder_habits"]);

  const dimensions = {
    livedExperience: scorePart(personalConnection, 20),
    customerAccess: scorePart(customerAccess, 20),
    unfairInsight: scorePart(unfairInsight, 20),
    credibility: scorePart(credibility, 20),
    persistence: scorePart(persistence, 20)
  };

  const total = Object.values(dimensions).reduce((sum, item) => sum + item, 0);
  const strengths: string[] = [];
  const gaps: string[] = [];
  const proofToCollect: string[] = [];

  if (dimensions.livedExperience >= 14) strengths.push("The founder can connect the idea to direct lived or observed experience.");
  else gaps.push("Founder connection is still thin; explain why this founder sees what others miss.");

  if (dimensions.customerAccess >= 14) strengths.push("There is a plausible path to first conversations or early users.");
  else {
    gaps.push("Customer access is not specific enough.");
    proofToCollect.push("A named list of 10 reachable people in the first customer segment.");
  }

  if (dimensions.unfairInsight >= 14) strengths.push("The founder is starting to expose a non-obvious insight about the workaround.");
  else {
    gaps.push("The unfair insight is still generic.");
    proofToCollect.push("Direct quotes about the current workaround, including exact words customers use.");
  }

  if (dimensions.credibility < 14) {
    gaps.push("Credibility with the buyer or user needs more evidence.");
    proofToCollect.push("A reason this customer would trust this founder or pilot this version.");
  }

  if (dimensions.persistence < 14) {
    gaps.push("Persistence signal is not yet strong enough for a long validation loop.");
    proofToCollect.push("A weekly validation cadence the founder can actually keep.");
  }

  return {
    total,
    label: profileLabel(total, "Strong founder-market fit", "Emerging founder-market fit", "Founder-market fit needs proof"),
    dimensions,
    narrative:
      `${angle.name} starts from "${observation.observationText}" and currently depends on whether the founder has enough lived insight, customer access, and persistence to learn faster than a generic entrant.`,
    strengths,
    gaps,
    proofToCollect
  };
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

export function calculateStartupReadinessScore(
  observation: ObservationInput,
  angle: BusinessAngle,
  answers: ProofCheckAnswer[]
): StartupReadinessScore {
  const founderPsychology = analyzeFounderPsychology(answers);
  const founderMarketFit = analyzeFounderMarketFit(observation, angle, answers);
  const founderFitEngine = analyzeFounderFitEngine(observation, angle, answers);
  const categories = {
    observationClarity: scorePart(quality(observation.observationText), 8),
    customerSpecificity: scorePart(quality(answer(answers, "who_cares")), 10),
    buyerClarity: scorePart(quality(answer(answers, "who_pays")), 10),
    currentWorkaroundClarity: scorePart(quality(answer(answers, "current_workaround")), 8),
    mvpClarity: scorePart(quality(answer(answers, "smallest_version") || angle.firstVersion), 8),
    validationEvidence: scorePart(quality(answer(answers, "evidence")), 12),
    founderMarketFit: scorePart(Math.max(founderMarketFit.total, founderFitEngine.fitScore) / 100, 10),
    founderPsychology: scorePart(founderPsychology.total / 100, 8),
    riskAwareness: scorePart(quality(answer(answers, "could_be_wrong")), 8),
    goToMarketClarity: scorePart(quality(answer(answers, "first_people")), 8),
    nextStepClarity: scorePart(quality(answer(answers, "what_proves_real")), 10)
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

  if (categories.founderMarketFit >= 7) strongSignals.push("Founder-market fit is visible enough to use in the story.");
  else missingProof.push("A clearer founder-market fit narrative and customer access path.");

  if (categories.founderPsychology >= 6) strongSignals.push("Founder psychology has useful operating signal.");
  else missingProof.push("Founder motivation, risk boundaries, and decision style.");

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
      "Write the founder-market fit narrative using evidence, not biography alone.",
      `Use the ${founderFitEngine.validationPath} validation path until evidence suggests a better route.`,
      "Ask who pays, how much, and what approval path exists.",
      "Collect direct quotes and objections.",
      "Update this dossier with proof before sharing broadly."
    ]
  };
}
