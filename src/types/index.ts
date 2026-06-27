export type ShareMode = "full" | "investor" | "builder" | "accelerator";

export type WhereNoticed =
  | "Work"
  | "Customers/clients"
  | "Family/life"
  | "Hobby/community"
  | "Health/medical"
  | "Music/creative"
  | "Money/finance"
  | "Education"
  | "Local business"
  | "Technology"
  | "Travel"
  | "Other";

export type IdeaState = "No, just checking" | "Maybe" | "Yes, I have a rough idea";

export type DesiredOutcome =
  | "Just scan for possibilities"
  | "Find a business angle"
  | "Create a startup plan"
  | "Build something"
  | "Prepare something to send or pitch";

export type SignalType =
  | "Repeated behaviour"
  | "Pain point"
  | "Workflow friction"
  | "Trust gap"
  | "Access gap"
  | "Convenience gap"
  | "Expensive manual process"
  | "Underserved group"
  | "Behaviour shift"
  | "Hidden demand"
  | "Community need"
  | "Information confusion"
  | "Coordination problem"
  | "Marketplace gap"
  | "Automation opportunity"
  | "Education gap"
  | "Creative bottleneck"
  | "Admin burden"
  | "Payment friction"
  | "Decision fatigue";

export type BusinessScanStatus =
  | "Business angle found"
  | "Strong opportunity signal"
  | "Interesting but needs more proof"
  | "Weak business signal"
  | "Probably not a business yet";

export type BusinessType =
  | "SaaS"
  | "Marketplace"
  | "Service business"
  | "AI tool"
  | "Content/community"
  | "Data product"
  | "Workflow automation"
  | "Consumer app"
  | "B2B tool"
  | "Education product"
  | "Local business tool"
  | "Creator tool";

export type ScoreBand =
  | "probably_not"
  | "needs_proof"
  | "worth_exploring"
  | "strong_early"
  | "high_confidence";

export type DossierSectionType =
  | "snapshot"
  | "full_dossier"
  | "accelerator_answers"
  | "faq"
  | "proof_check"
  | "readiness_score"
  | "mvp_build_brief"
  | "validation_sprint"
  | "founder_video_script"
  | "outreach_email"
  | "data_room_checklist"
  | "missing_proof";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type ObservationInput = {
  id: string;
  observationText: string;
  optionalContext: string;
  whereNoticed: WhereNoticed;
  ideaState: IdeaState;
  desiredOutcome: DesiredOutcome;
  createdAt: string;
};

export type BusinessAngle = {
  id: string;
  name: string;
  oneLineDescription: string;
  whoItHelps: string;
  whoMightPay: string;
  whyItMightWork: string;
  firstVersion: string;
  businessType: BusinessType;
  difficulty: number;
  potential: number;
  risk: number;
  founderFit: number;
  recommendedNextStep: string;
};

export type BusinessPotentialScore = {
  total: number;
  band: ScoreBand;
  label: string;
  status: BusinessScanStatus;
  categories: {
    frequency: number;
    painOrImportance: number;
    buyerClarity: number;
    moneyMovement: number;
    currentWorkaround: number;
    easeOfFirstVersion: number;
    founderFit: number;
    timing: number;
    marketExpansion: number;
    proofAvailable: number;
  };
  strongSignals: string[];
  weakSignals: string[];
  missingProof: string[];
  recommendedNextStep: string;
};

export type BusinessScan = {
  id: string;
  observationInput: ObservationInput;
  interpretation: string;
  signalTypes: SignalType[];
  affectedGroups: string[];
  whyItMayMatter: string;
  currentWorkaround: string;
  status: BusinessScanStatus;
  potentialScore: BusinessPotentialScore;
  angles: BusinessAngle[];
  saved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProofCheckQuestion = {
  id: string;
  question: string;
  helperText: string;
};

export type ProofCheckAnswer = ProofCheckQuestion & {
  answer: string;
  signal: "strong" | "medium" | "weak";
};

export type StartupReadinessScore = {
  total: number;
  band: ScoreBand;
  label: string;
  categories: {
    observationClarity: number;
    customerSpecificity: number;
    buyerClarity: number;
    currentWorkaroundClarity: number;
    mvpClarity: number;
    validationEvidence: number;
    founderFit: number;
    riskAwareness: number;
    goToMarketClarity: number;
    nextStepClarity: number;
  };
  strongSignals: string[];
  weakSignals: string[];
  missingProof: string[];
  nextActions: string[];
};

export type MissingProofItem = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
};

export type ValidationTask = {
  id: string;
  title: string;
  description: string;
  phase: "14-day" | "30-day";
  status: "todo" | "doing" | "done";
};

export type DossierSection = {
  id: string;
  type: DossierSectionType;
  title: string;
  content: string;
  order: number;
  updatedAt: string;
};

export type ShareLink = {
  id: string;
  dossierId: string;
  shareToken: string;
  mode: ShareMode;
  isActive: boolean;
  createdAt: string;
};

export type StartupDossier = {
  id: string;
  scanId: string;
  sourceObservation: string;
  selectedAngle: BusinessAngle;
  startupName: string;
  slug: string;
  oneLiner: string;
  status: BusinessScanStatus;
  readinessScore: StartupReadinessScore;
  sections: DossierSection[];
  proofAnswers: ProofCheckAnswer[];
  missingProofItems: MissingProofItem[];
  validationTasks: ValidationTask[];
  shareLinks: ShareLink[];
  createdAt: string;
  updatedAt: string;
};

export type AppData = {
  scans: BusinessScan[];
  dossiers: StartupDossier[];
  userProfile?: UserProfile;
};

export type SharedDossierResult = {
  dossier: StartupDossier;
  shareLink: ShareLink;
};
