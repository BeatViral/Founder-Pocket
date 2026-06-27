import { analyzeFounderFitEngine } from "./scoringService";
import type {
  BusinessAngle,
  BusinessScan,
  FounderFitEngineProfile,
  FounderProfile,
  ObservationInput,
  ProofCheckAnswer
} from "../types";

export type FounderFitAnalysis = {
  founderArchetype: string;
  behaviourMode: string;
  insightTypes: string[];
  domainFitScore: number;
  credibilityScore: number;
  customerAccessScore: number;
  validationAbilityScore: number;
  buildAbilityScore: number;
  communicationFit: string;
  founderFitScore: number;
  strongFitSignals: string[];
  weakFitSignals: string[];
  recommendedFounderPath: string;
  adaptedTone: string;
  adaptedValidationStyle: string;
  adaptedShareEmphasis: FounderFitEngineProfile["adaptation"]["shareEmphasis"];
};

const profileAnswers = (profile?: FounderProfile): ProofCheckAnswer[] => {
  if (!profile) return [];
  const answer = [
    profile.background,
    profile.roleType,
    profile.industry,
    `${profile.yearsExperience} years`,
    profile.strengths.join(", "),
    profile.networkAccess
  ]
    .filter(Boolean)
    .join(" ");

  return [
    {
      id: "founder_background",
      question: "What founder background matters here?",
      helperText: "Generated from founder profile.",
      answer,
      signal: answer.length > 40 ? "strong" : "medium"
    },
    {
      id: "founder_risk_tolerance",
      question: "What is the founder risk comfort?",
      helperText: "Generated from founder profile.",
      answer: profile.riskComfort,
      signal: profile.riskComfort ? "medium" : "weak"
    },
    {
      id: "founder_habits",
      question: "What validation comfort exists?",
      helperText: "Generated from founder profile.",
      answer: profile.validationComfort,
      signal: profile.validationComfort ? "medium" : "weak"
    }
  ];
};

export function analyzeFounderFit(
  observationInput: ObservationInput,
  scan: BusinessScan | undefined,
  selectedAngle: BusinessAngle,
  proofAnswers: ProofCheckAnswer[],
  founderProfile?: FounderProfile
): FounderFitAnalysis {
  const enrichedObservation = {
    ...observationInput,
    optionalContext: [observationInput.optionalContext, scan?.interpretation, founderProfile?.background]
      .filter(Boolean)
      .join(" "),
    founderContext: [observationInput.founderContext, founderProfile?.background, founderProfile?.networkAccess]
      .filter(Boolean)
      .join(" ")
  };
  const profileDrivenAnswers = [...proofAnswers, ...profileAnswers(founderProfile)];
  const profile = analyzeFounderFitEngine(enrichedObservation, selectedAngle, profileDrivenAnswers);

  return {
    founderArchetype: profile.primaryArchetype,
    behaviourMode: profile.behaviourMode,
    insightTypes: profile.insightTypes,
    domainFitScore: profile.dimensions.domainFit,
    credibilityScore: profile.dimensions.credibilityFit,
    customerAccessScore: profile.dimensions.customerAccess,
    validationAbilityScore: profile.dimensions.validationAbility,
    buildAbilityScore: profile.dimensions.buildOrBriefAbility,
    communicationFit: profile.communicationStyle,
    founderFitScore: profile.fitScore,
    strongFitSignals: profile.strongSignals,
    weakFitSignals: profile.weakSignals,
    recommendedFounderPath: profile.validationPath,
    adaptedTone: profile.adaptation.dossierTone,
    adaptedValidationStyle: profile.adaptation.proofQuestionMode,
    adaptedShareEmphasis: profile.adaptation.shareEmphasis
  };
}
