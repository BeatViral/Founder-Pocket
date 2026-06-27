import {
  analyzeFounderFitEngine,
  analyzeFounderMarketFit,
  analyzeFounderPsychology,
  calculateBusinessPotentialScore,
  calculateStartupReadinessScore,
  signalForAnswer
} from "./scoringService";
import type {
  BusinessAngle,
  BusinessScan,
  BusinessType,
  DossierSection,
  MissingProofItem,
  ObservationInput,
  ProofCheckAnswer,
  ProofCheckQuestion,
  SignalType,
  StartupDossier,
  ValidationTask
} from "../types";

export const whereNoticedOptions = [
  "Work",
  "Customers/clients",
  "Family/life",
  "Hobby/community",
  "Health/medical",
  "Music/creative",
  "Money/finance",
  "Education",
  "Local business",
  "Technology",
  "Travel",
  "Other"
] as const;

export const ideaStateOptions = ["No, just checking", "Maybe", "Yes, I have a rough idea"] as const;

export const desiredOutcomeOptions = [
  "Just scan for possibilities",
  "Find a business angle",
  "Create a startup plan",
  "Build something",
  "Prepare something to share"
] as const;

export const exampleObservations = [
  "Patients forget what doctors tell them after appointments.",
  "Musicians have hard drives full of unfinished songs.",
  "Parents keep asking teachers the same questions.",
  "Tradies spend nights writing quotes.",
  "Small restaurants waste food but still run out of popular dishes.",
  "People want help, but don't know what service to ask for.",
  "Older people struggle with government forms.",
  "Small clinics still use phone calls for everything.",
  "People buy fitness plans but stop after two weeks.",
  "Creators never know which idea to build first."
];

const uid = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const asSentence = (value: string, fallback: string) => {
  const text = value.trim() || fallback;
  return /[.!?]$/.test(text) ? text : `${text}.`;
};

const includes = (text: string, pattern: RegExp) => pattern.test(text);

const domain = (input: ObservationInput | string) => {
  const text =
    typeof input === "string"
      ? input
      : `${input.observationText} ${input.optionalContext} ${input.whereNoticed}`;
  if (includes(text, /doctor|patient|clinic|medical|health|gp|hospital|nurse|appointment/i)) return "health";
  if (includes(text, /music|musician|song|daw|artist|producer|singer|record|demo/i)) return "music";
  if (includes(text, /teacher|school|parent|student|classroom|homework|education/i)) return "education";
  if (includes(text, /tradie|quote|construction|plumber|electrician|builder|job notes|contractor/i)) return "tradie";
  if (includes(text, /restaurant|food|kitchen|cafe|menu|prep|popular dishes/i)) return "restaurant";
  return "general";
};

const angle = (
  name: string,
  oneLineDescription: string,
  whoItHelps: string,
  whoMightPay: string,
  whyItMightWork: string,
  firstVersion: string,
  businessType: BusinessType,
  difficulty: number,
  potential: number,
  risk: number,
  founderFit: number,
  recommendedNextStep: string
): BusinessAngle => ({
  id: uid("angle"),
  name,
  oneLineDescription,
  whoItHelps,
  whoMightPay,
  whyItMightWork,
  firstVersion,
  businessType,
  difficulty,
  potential,
  risk,
  founderFit,
  recommendedNextStep
});

export function createObservationInput(partial: Omit<ObservationInput, "id" | "createdAt">): ObservationInput {
  return {
    id: uid("observation"),
    createdAt: new Date().toISOString(),
    ...partial
  };
}

export function classifyObservation(observationText: string): SignalType[] {
  const signals = new Set<SignalType>();
  const text = observationText.toLowerCase();

  if (/keep|keeps|always|often|every|repeat|same/.test(text)) signals.add("Repeated behaviour");
  if (/forget|struggle|waste|miss|hard|slow|stress|run out|unfinished/.test(text)) signals.add("Pain point");
  if (/workflow|process|admin|forms|quote|calls|manual|notes/.test(text)) signals.add("Workflow friction");
  if (/trust|scam|uncertain|safe|advice/.test(text)) signals.add("Trust gap");
  if (/access|older|disabled|remote|can't|cannot|hard to get/.test(text)) signals.add("Access gap");
  if (/easy|convenient|nights|quick|hours/.test(text)) signals.add("Convenience gap");
  if (/manual|hours|nights|staff|admin|calls/.test(text)) signals.add("Expensive manual process");
  if (/older|small|independent|non-technical|parents|artists|tradies/.test(text)) signals.add("Underserved group");
  if (/still|now|anymore|shift|changed/.test(text)) signals.add("Behaviour shift");
  if (/want|asking|need|demand|help/.test(text)) signals.add("Hidden demand");
  if (/community|parents|creators|artists|class|local/.test(text)) signals.add("Community need");
  if (/confus|instructions|forms|questions|know which/.test(text)) signals.add("Information confusion");
  if (/coordinate|follow|appointment|teacher|clinic|phone/.test(text)) signals.add("Coordination problem");
  if (/marketplace|find|connect|service/.test(text)) signals.add("Marketplace gap");
  if (/automate|ai|tool|dashboard|track|prediction/.test(text)) signals.add("Automation opportunity");
  if (/learn|education|school|teacher|training/.test(text)) signals.add("Education gap");
  if (/music|song|creative|creator|artist|unfinished/.test(text)) signals.add("Creative bottleneck");
  if (/admin|paperwork|intake|quote|forms|phone/.test(text)) signals.add("Admin burden");
  if (/pay|payment|invoice|pricing|quote|money/.test(text)) signals.add("Payment friction");
  if (/which|choose|decision|ideas|options/.test(text)) signals.add("Decision fatigue");

  if (!signals.size) {
    signals.add("Hidden demand");
    signals.add("Pain point");
    signals.add("Information confusion");
  }

  return Array.from(signals).slice(0, 6);
}

export function generateBusinessAngles(input: ObservationInput): BusinessAngle[] {
  const d = domain(input);

  if (d === "health") {
    return adaptAnglesForFounder(input, [
      angle(
        "AfterVisit Notes",
        "A tool that turns doctor instructions into clear patient follow-up summaries.",
        "Patients who leave appointments unsure what to do next",
        "Clinics, specialist practices, and allied health providers",
        "The moment after an appointment is high-risk for confusion, missed instructions, and avoidable follow-up calls.",
        "A clinician or admin creates a plain-language visit summary with next steps, dates, and warning signs.",
        "B2B tool",
        5,
        78,
        6,
        7,
        "Test with 5 clinicians and 10 patients after real appointments."
      ),
      angle(
        "FollowUp Radar",
        "A clinic dashboard for tracking patient follow-ups, tests, and overdue actions.",
        "Small clinics that manage follow-up through memory, calls, and scattered notes",
        "Practice owners, clinic managers, and specialist rooms",
        "Follow-up tasks already exist. The business opportunity is making them visible before they become risk.",
        "A dashboard with patient task, due date, owner, status, reminder template, and overdue list.",
        "Workflow automation",
        6,
        82,
        6,
        8,
        "Run a concierge version with one clinic using a spreadsheet and weekly report."
      ),
      angle(
        "Health Instructions Library",
        "A plain-language care instruction library clinics can send after appointments.",
        "Clinics that repeat the same explanation to many patients",
        "Practice owners and health providers",
        "Repeated education content can be standardized without pretending to replace clinical judgment.",
        "A searchable library of approved instruction templates with SMS/email send links.",
        "Education product",
        4,
        68,
        5,
        6,
        "Collect the 20 instructions clinics repeat most often."
      )
    ]);
  }

  if (d === "music") {
    return adaptAnglesForFounder(input, [
      angle(
        "FinishFlow",
        "A guided creative workflow that helps musicians turn unfinished demos into finished releases.",
        "Musicians with unfinished songs, demos, stems, and voice notes",
        "Independent artists, producers, creator communities, and music educators",
        "The pain is not only recording. It is losing momentum between idea, arrangement, mix, and release.",
        "A project checklist that moves one song through arrangement, vocal, mix notes, artwork, and release tasks.",
        "Creator tool",
        5,
        75,
        6,
        8,
        "Interview 10 artists with unfinished demos and map where songs stall."
      ),
      angle(
        "PHATSO Studio",
        "A recording workflow for non-technical artists who want finished songs without engineering complexity.",
        "Singers, topliners, songwriters, and creators who do not want to learn a full DAW",
        "Creators via subscription, paid export packs, or music programs",
        "Many creators can write and perform, but engineering tools interrupt the creative act.",
        "Import a beat, record vocals, apply a simple preset chain, level audio, and export a demo.",
        "Creator tool",
        7,
        80,
        7,
        9,
        "Prototype the guided vocal workflow before building a full music platform."
      ),
      angle(
        "Demo Rescue",
        "A service plus software workflow that helps artists finish one stuck song at a time.",
        "Artists who have one promising unfinished track",
        "Artists, managers, and creator schools",
        "A service-led first version can prove demand before software complexity.",
        "A guided intake form plus producer review that returns a finish plan and simple next actions.",
        "Service business",
        3,
        66,
        4,
        8,
        "Offer 10 manual demo rescue sessions and measure willingness to pay."
      )
    ]);
  }

  if (d === "education") {
    return adaptAnglesForFounder(input, [
      angle(
        "ClassPulse",
        "A parent update assistant that helps teachers send simple progress updates without extra admin.",
        "Teachers and parents who repeat the same communication loops",
        "Schools, tutoring centers, or parent-funded classrooms",
        "The questions are repeated, emotional, and time-consuming for teachers.",
        "Weekly class update templates, common question answers, and one-click parent messages.",
        "Education product",
        4,
        72,
        5,
        7,
        "Test with 5 teachers and collect the top 20 repeated parent questions."
      ),
      angle(
        "ParentLoop",
        "A lightweight Q&A hub for recurring parent questions and classroom updates.",
        "Parents who need simple answers and teachers who need fewer repeat messages",
        "Schools, PTAs, and tutoring businesses",
        "Most value may come from reducing repeated communication, not adding another portal.",
        "A class page with updates, FAQs, reminders, and read receipts.",
        "B2B tool",
        5,
        68,
        5,
        6,
        "Run a 2-week class communication pilot with one teacher."
      )
    ]);
  }

  if (d === "tradie") {
    return adaptAnglesForFounder(input, [
      angle(
        "QuoteMate",
        "A tool that helps tradies turn job notes into professional quotes quickly.",
        "Tradies who quote jobs at night after site visits",
        "Solo tradies, small trade teams, and service businesses",
        "Quoting is close to revenue, repeated often, and already tied to money movement.",
        "Capture job notes, materials, photos, and rates, then generate a clean quote draft.",
        "Local business tool",
        5,
        82,
        5,
        7,
        "Shadow 5 tradies through a quoting week and build the smallest quote draft workflow."
      ),
      angle(
        "SiteNote Quotes",
        "A mobile-first workflow that turns site photos and voice notes into quote-ready job summaries.",
        "Builders, electricians, plumbers, landscapers, and small contractors",
        "Trade business owners and office managers",
        "The first product can start before accounting integrations by organizing the quote inputs.",
        "Voice note, photo upload, line item checklist, and quote summary export.",
        "Workflow automation",
        6,
        76,
        6,
        7,
        "Offer a manual quote-summary service and see if tradies send real jobs."
      )
    ]);
  }

  if (d === "restaurant") {
    return adaptAnglesForFounder(input, [
      angle(
        "PrepSense",
        "A simple demand prediction and prep planning tool for small restaurants.",
        "Independent restaurants that waste food while still running out of popular dishes",
        "Restaurant owners and kitchen managers",
        "Food waste and stockouts are both costly, visible, and repeated weekly.",
        "Daily prep planner using menu items, day of week, weather notes, and past sell-through.",
        "Data product",
        6,
        78,
        6,
        7,
        "Run a spreadsheet pilot with 3 restaurants for 2 weeks."
      ),
      angle(
        "WasteWatch",
        "A lightweight waste log that shows which ingredients and dishes keep creating losses.",
        "Small kitchens without a dedicated analyst or inventory system",
        "Owners, chefs, and operations managers",
        "A narrow waste log can create value before predicting demand.",
        "End-of-shift waste capture, reason tags, and weekly loss report.",
        "Local business tool",
        4,
        70,
        4,
        6,
        "Test whether managers will log waste daily for one week."
      )
    ]);
  }

  const observation = input.observationText.replace(/\.$/, "");
  return adaptAnglesForFounder(input, [
    angle(
      "PatternDesk",
      `A focused workspace for people dealing with this repeated pattern: ${observation}.`,
      "The narrow group closest to the repeated observation",
      "The person or team who loses time, money, trust, or output quality because of it",
      "Repeated behaviour often hides a workflow people already try to manage manually.",
      "A simple intake, tracker, reminder, and summary around the first painful workflow.",
      "Workflow automation",
      5,
      64,
      5,
      6,
      "Name the first customer group and interview 10 of them."
    ),
    angle(
      "NeedSignal",
      `A signal-gathering tool that helps people explain, rank, and act on the need behind: ${observation}.`,
      "People who feel the problem but do not know what help to ask for",
      "Service providers, communities, advisors, or teams trying to understand demand",
      "Confusion can become a product if it helps people make a better decision or request.",
      "A guided question flow that turns messy need into a clear recommendation or next step.",
      "AI tool",
      6,
      62,
      6,
      5,
      "Test whether people will complete the flow and act on the recommendation."
    ),
    angle(
      "LocalLoop",
      `A service-led pilot that solves one local version of this observation: ${observation}.`,
      "A local or community group with the clearest version of the problem",
      "Local businesses, community organizers, or households",
      "Starting as a service can reveal whether the pain is real before software is built.",
      "Manual concierge workflow, weekly report, and a simple booking or tracking page.",
      "Service business",
      3,
      58,
      4,
      6,
      "Offer the manual version to 5 people and ask what they would pay to keep it."
    )
  ]);
}

function scanInterpretation(input: ObservationInput) {
  const d = domain(input);
  if (d === "health") return "This looks like a healthcare communication and follow-up problem. The business may sit in reducing missed instructions, manual admin, or clinical follow-up risk.";
  if (d === "music") return "This looks like a creative bottleneck. The business may sit in helping creators finish work without forcing them through technical workflows.";
  if (d === "education") return "This looks like repeated communication friction between teachers, parents, and students. The business may sit in reducing repeated questions and admin.";
  if (d === "tradie") return "This looks like revenue-adjacent admin burden. The business may sit in turning job information into faster quotes or follow-up.";
  if (d === "restaurant") return "This looks like an operations planning problem. The business may sit in reducing waste, stockouts, and repeated kitchen guesswork.";
  return "This looks like a repeated pattern that may hide a business if the affected group, current workaround, and willingness to pay can be proven.";
}

function founderSpecificAngle(input: ObservationInput): BusinessAngle | undefined {
  const text = `${input.founderContext ?? ""} ${input.optionalContext} ${input.observationText}`;
  const observation = input.observationText.replace(/\.$/, "");

  if (!input.founderContext?.trim()) return undefined;

  if (includes(text, /developer|software|technical|code|engineer|api|automation|prototype|build|product/i)) {
    return angle(
      "FounderFit Prototype",
      `A prototype-first product wedge around the repeated workflow behind: ${observation}.`,
      "The narrow users closest to the repeated workflow",
      "The team or buyer who needs the workflow solved without a full platform",
      "A technical or builder founder can test the workflow quickly by showing a working prototype instead of only describing the idea.",
      "A clickable or lightweight working prototype with one workflow, one status, and one proof capture step.",
      "SaaS",
      6,
      72,
      6,
      8,
      "Build the thinnest prototype and test it with 5 users before adding integrations."
    );
  }

  if (includes(text, /creator|artist|musician|writer|producer|audience|content|community|newsletter|youtube|tiktok|podcast/i)) {
    return angle(
      "Audience Proof Loop",
      `A creator-led test for turning the observation into audience demand: ${observation}.`,
      "People already gathered around the founder's audience, niche, or community",
      "Community members, sponsors, paid subscribers, course buyers, or service customers",
      "A creator founder can validate demand through content, replies, waitlists, and direct audience signals before building software.",
      "A short content series, waitlist, and manual offer that tests the pain and the first solution promise.",
      "Content/community",
      4,
      70,
      5,
      8,
      "Publish the observation, collect replies, and invite 20 people into a manual proof sprint."
    );
  }

  if (includes(text, /doctor|nurse|teacher|chef|clinician|therapist|lawyer|accountant|domain|specialist|expert|industry|insider/i)) {
    return angle(
      "Insider Workflow Wedge",
      `An expert-led workflow product based on insider knowledge of: ${observation}.`,
      "Peers and operators who already trust the founder's domain understanding",
      "Practices, teams, operators, or budget owners inside the founder's field",
      "A domain expert can use credibility and exact workflow knowledge to reach better first users than a generic entrant.",
      "A narrow expert workflow template, tracker, or concierge version that proves the domain-specific wedge.",
      "B2B tool",
      5,
      76,
      5,
      9,
      "Use expert credibility to book 8 workflow interviews and run one concierge pilot."
    );
  }

  if (includes(text, /sales|sell|buyer|commercial|pricing|revenue|paid|pilot|client|business owner|consultant|agency|service/i)) {
    return angle(
      "Paid Pilot Offer",
      `A commercial proof path that starts with selling the smallest useful version of: ${observation}.`,
      "Buyers who feel the pain clearly enough to commit before the product is polished",
      "Business owners, budget holders, managers, or clients",
      "A commercial or service founder can validate faster by asking for commitment instead of hiding behind product scope.",
      "A manual paid pilot offer with clear outcome, timeline, price, and success criteria.",
      "Service business",
      3,
      74,
      4,
      8,
      "Ask 5 likely buyers about a paid pilot and document price objections."
    );
  }

  if (includes(text, /admin|operator|operations|manager|coordinator|workflow|process|running|manage/i)) {
    return angle(
      "Operator Control Room",
      `An operator-first dashboard for managing the messy workflow behind: ${observation}.`,
      "Operators who already coordinate the work manually",
      "Operations leads, practice managers, owners, and team leads",
      "An operator founder can see the daily workflow details and design a practical system around real constraints.",
      "A dashboard with intake, owner, status, due date, notes, and a weekly report.",
      "Workflow automation",
      5,
      78,
      5,
      9,
      "Run the dashboard manually for one team and measure time saved."
    );
  }

  return undefined;
}

function adaptAnglesForFounder(input: ObservationInput, angles: BusinessAngle[]): BusinessAngle[] {
  if (!input.founderContext?.trim()) return angles;

  const founderAngle = founderSpecificAngle(input);
  const candidates = founderAngle ? [founderAngle, ...angles] : angles;

  return candidates
    .map((item) => {
      const fit = analyzeFounderFitEngine(input, item, []);
      const fitLift = fit.fitScore >= 55 ? 6 : fit.fitScore >= 40 ? 3 : 0;
      return {
        ...item,
        founderFit: Math.min(10, Math.max(item.founderFit, Math.round(fit.fitScore / 10))),
        potential: Math.min(95, item.potential + fitLift),
        recommendedNextStep: `${fit.adaptation.angleStrategy} ${item.recommendedNextStep}`
      };
    })
    .sort((a, b) => b.founderFit + b.potential / 20 - (a.founderFit + a.potential / 20))
    .slice(0, 5);
}

function affectedGroups(input: ObservationInput) {
  const d = domain(input);
  if (d === "health") return ["Patients", "Small clinics", "Practice managers", "Clinicians"];
  if (d === "music") return ["Independent artists", "Songwriters", "Producers", "Creator schools"];
  if (d === "education") return ["Teachers", "Parents", "School admins", "Tutoring teams"];
  if (d === "tradie") return ["Solo tradies", "Small trade teams", "Office managers", "Home service customers"];
  if (d === "restaurant") return ["Restaurant owners", "Kitchen managers", "Chefs", "Shift leads"];
  return ["People closest to the observation", "A narrow customer segment", "Operators managing the workaround"];
}

function currentWorkaround(input: ObservationInput) {
  const d = domain(input);
  if (d === "health") return "Phone calls, paper notes, memory, reception reminders, and disconnected clinic systems.";
  if (d === "music") return "DAW projects, hard drives, voice notes, informal producer help, and unfinished folder systems.";
  if (d === "education") return "Repeated messages, newsletters, classroom apps, and teachers answering the same questions manually.";
  if (d === "tradie") return "Notebook notes, photos, late-night quote writing, spreadsheets, and accounting tools after the fact.";
  if (d === "restaurant") return "Chef intuition, paper prep lists, rough ordering habits, POS exports, and end-of-day waste guesses.";
  return "Manual workarounds, generic tools, messages, spreadsheets, and extra human coordination.";
}

export function generateBusinessScan(input: ObservationInput): BusinessScan {
  const createdAt = new Date().toISOString();
  const signalTypes = classifyObservation(`${input.observationText} ${input.optionalContext}`);
  const angles = generateBusinessAngles(input);
  const potentialScore = calculateBusinessPotentialScore(input, signalTypes, angles);

  return {
    id: uid("scan"),
    observationInput: input,
    interpretation: scanInterpretation(input),
    signalTypes,
    affectedGroups: affectedGroups(input),
    whyItMayMatter:
      "A business may exist when a repeated observation creates enough pain, cost, confusion, risk, or time loss that a specific group already tries to solve it.",
    currentWorkaround: currentWorkaround(input),
    status: potentialScore.status,
    potentialScore,
    angles,
    saved: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function generateProofCheckQuestions(context?: {
  scan?: BusinessScan;
  angle?: BusinessAngle;
}): ProofCheckQuestion[] {
  const baseQuestions: ProofCheckQuestion[] = [
    {
      id: "who_cares",
      question: "Who exactly would care about this?",
      helperText: "Do not write everyone. Name the first narrow group that would feel this most."
    },
    {
      id: "frequency",
      question: "How often does this happen?",
      helperText: "Use a real rhythm: daily, weekly, every appointment, every job, every project, or every season."
    },
    {
      id: "current_workaround",
      question: "What do people do about it now?",
      helperText: "Current workarounds matter. Mention spreadsheets, calls, notes, hired help, or messy habits."
    },
    {
      id: "cost",
      question: "Does it cost time, money, stress, risk, or lost opportunity?",
      helperText: "Tie the problem to a consequence someone already feels."
    },
    {
      id: "who_pays",
      question: "Who could pay for a solution?",
      helperText: "Separate the user from the buyer. Name the person or budget owner."
    },
    {
      id: "why_now",
      question: "Why would they pay now?",
      helperText: "What has changed? Pressure, tools, habits, regulation, competition, cost, or expectations?"
    },
    {
      id: "smallest_version",
      question: "What is the smallest useful first version?",
      helperText: "Describe the one useful workflow that could prove demand before a full product."
    },
    {
      id: "first_people",
      question: "Can you name 5 to 10 people who might react to this?",
      helperText: "Names, roles, communities, customer types, or warm channels all count."
    },
    {
      id: "what_proves_real",
      question: "What would prove this is real?",
      helperText: "Look for evidence: interviews, waitlist, paid pilot, repeated requests, LOIs, usage, or referrals."
    },
    {
      id: "could_be_wrong",
      question: "What could make this idea wrong?",
      helperText: "A strong proof check names the risk, not just the upside."
    },
    {
      id: "seen_personally",
      question: "Have you seen this personally?",
      helperText: "Explain your personal connection to the observation, even if it is early."
    },
    {
      id: "founder_background",
      question: "What background, skill, community access, or lived experience gives you an edge?",
      helperText: "This can be work experience, personal history, domain access, creative taste, technical skill, or a network."
    },
    {
      id: "founder_motivation",
      question: "Why do you personally want to keep working on this?",
      helperText: "Name the motivation that would still matter after the easy excitement wears off."
    },
    {
      id: "founder_decision_style",
      question: "How do you usually make hard decisions?",
      helperText: "Mention whether you decide through data, conversations, instinct, deadlines, experiments, or outside feedback."
    },
    {
      id: "founder_risk_tolerance",
      question: "What risk are you willing or unwilling to take here?",
      helperText: "Be honest about time, money, reputation, health, team, or opportunity-cost limits."
    },
    {
      id: "founder_habits",
      question: "What founder habit will help or hurt you here?",
      helperText: "Think about follow-through, focus, shipping speed, avoiding hard conversations, overbuilding, or asking for help."
    },
    {
      id: "evidence",
      question: "Do you have any evidence already?",
      helperText: "Mention direct conversations, repeated examples, payment, screenshots, customer requests, or notes."
    }
  ];

  const scan = context?.scan;
  const angle = context?.angle;
  if (!scan || !angle) return baseQuestions;

  const engine = analyzeFounderFitEngine(scan.observationInput, angle, []);
  const adaptiveQuestions: ProofCheckQuestion[] = [];

  if (engine.primaryArchetype === "Technical Founder" || engine.primaryArchetype === "Builder Founder") {
    adaptiveQuestions.push({
      id: "technical_unknowns",
      question: "What is technically unknown or risky about the first version?",
      helperText: "Name integrations, data, workflow edge cases, security, complexity, or what you would prototype first."
    });
  }

  if (engine.primaryArchetype === "Commercial Founder" || engine.primaryArchetype === "Service Founder") {
    adaptiveQuestions.push({
      id: "commercial_commitment",
      question: "What exact commitment could you ask for before building more?",
      helperText: "Name the paid pilot, LOI, intro, deposit, waitlist action, or next meeting you would ask for."
    });
  }

  if (engine.primaryArchetype === "Creator Founder" || engine.primaryArchetype === "Community Founder") {
    adaptiveQuestions.push({
      id: "audience_signal",
      question: "What audience or community signal would prove people care?",
      helperText: "Think replies, comments, signups, paid interest, shares, referrals, or people asking for the next step."
    });
  }

  if (engine.primaryArchetype === "Domain Expert Founder" || engine.primaryArchetype === "Industry Insider Founder") {
    adaptiveQuestions.push({
      id: "domain_credibility",
      question: "What domain credibility lets you see or test this better than an outsider?",
      helperText: "Mention trust, access, professional context, insider workflow knowledge, or specific people who will talk to you."
    });
  }

  if (engine.behaviourMode === "Hesitant Explorer" || engine.behaviourMode === "Early Beginner") {
    adaptiveQuestions.push({
      id: "low_pressure_next_step",
      question: "What is the lowest-pressure validation step you can actually do this week?",
      helperText: "Pick a step small enough to complete: one message, one note, one call, one post, or one mockup."
    });
  }

  if (!adaptiveQuestions.length) {
    adaptiveQuestions.push({
      id: "founder_specific_path",
      question: "What path fits you better than a generic founder?",
      helperText: "Name whether you should validate through interviews, prototype, audience, client work, expert access, or email."
    });
  }

  return [...baseQuestions, ...adaptiveQuestions].filter(
    (question, index, questions) => questions.findIndex((item) => item.id === question.id) === index
  );
}

export function createProofAnswers(
  raw: Record<string, string>,
  context?: { scan?: BusinessScan; angle?: BusinessAngle }
): ProofCheckAnswer[] {
  return generateProofCheckQuestions(context).map((question) => ({
    ...question,
    answer: raw[question.id] ?? "",
    signal: signalForAnswer(raw[question.id] ?? "")
  }));
}

function answerById(answers: ProofCheckAnswer[], id: string, fallback: string) {
  return asSentence(answers.find((answer) => answer.id === id)?.answer ?? "", fallback);
}

export function generateStartupName(scan: BusinessScan, angle: BusinessAngle) {
  if (angle.name) return angle.name;
  const d = domain(scan.observationInput);
  if (d === "health") return "FollowUp Radar";
  if (d === "music") return "FinishFlow";
  if (d === "education") return "ClassPulse";
  if (d === "tradie") return "QuoteMate";
  if (d === "restaurant") return "PrepSense";
  return "PatternDesk";
}

export function generateOneLiner(angle: BusinessAngle) {
  return angle.oneLineDescription;
}

const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

function dossierToneGuidance(engine: ReturnType<typeof analyzeFounderFitEngine>) {
  const guidance: Record<ReturnType<typeof analyzeFounderFitEngine>["communicationStyle"], string> = {
    plain: "Keep the dossier plain, concrete, and low-pressure. Lead with proof questions and simple next steps.",
    technical: "Make the dossier precise about workflow, prototype scope, data objects, integrations, and technical unknowns.",
    structured: "Use clear headings, evidence thresholds, decision rules, and measurable validation milestones.",
    narrative: "Lead with the lived observation, founder story, audience signal, and why this problem keeps showing up.",
    commercial: "Emphasize buyer urgency, budget owner, price test, paid pilot path, and objection evidence.",
    practical: "Keep the dossier operational: workflow, current workaround, time saved, first pilot, and weekly proof rhythm.",
    "founder-authentic": "Use a direct founder voice while separating personal conviction from customer evidence."
  };

  return guidance[engine.communicationStyle];
}

function snapshot(
  scan: BusinessScan,
  angle: BusinessAngle,
  answers: ProofCheckAnswer[],
  engine: ReturnType<typeof analyzeFounderFitEngine>
) {
  return `# ${angle.name}

${angle.oneLineDescription}

## Original observation
${scan.observationInput.observationText}

## Business angle
${angle.name}

## Who it helps
${angle.whoItHelps}

## Who might pay
${answerById(answers, "who_pays", angle.whoMightPay)}

## Why it matters
${scan.whyItMayMatter}

## First wedge
${answerById(answers, "smallest_version", angle.firstVersion)}

## Founder fit
Score: ${engine.fitScore}/100

Why this fits: ${engine.adaptation.angleStrategy}

Recommended founder path: ${engine.validationPath}

## Dossier tone
${dossierToneGuidance(engine)}

## Business model
${angle.businessType} with a narrow paid pilot, subscription, service package, or usage-based path depending on the buyer.

## Current proof
${answerById(answers, "evidence", "Current proof is mostly the original observation and needs direct customer evidence.")}

## Missing proof
${answerById(answers, "what_proves_real", "Missing proof includes urgency, willingness to pay, and repeat usage.")}

## Next milestone
${angle.recommendedNextStep}`;
}

function fullDossier(
  scan: BusinessScan,
  angle: BusinessAngle,
  answers: ProofCheckAnswer[],
  engine: ReturnType<typeof analyzeFounderFitEngine>
) {
  return `## 1. Executive Summary
${angle.name} is a business worth exploring from the observation: "${scan.observationInput.observationText}" ${angle.oneLineDescription}

## 2. Founder Fit Lens
Founder Fit Score: ${engine.fitScore}/100

Why this fits: ${engine.adaptation.angleStrategy}

Recommended founder path: ${engine.validationPath}

Dossier tone: ${dossierToneGuidance(engine)}

## 3. Original Observation
${scan.observationInput.observationText}

## 4. Business Insight
${scan.interpretation}

## 5. Problem or Opportunity
${answerById(answers, "cost", "The opportunity is to reduce repeated pain, wasted time, confusion, risk, or manual effort.")}

## 6. Target Customer
${answerById(answers, "who_cares", angle.whoItHelps)}

## 7. Current Workarounds
${answerById(answers, "current_workaround", scan.currentWorkaround)}

## 8. Product Thesis
${angle.oneLineDescription} The product should begin with one narrow workflow and avoid acting like a full platform too early.

## 9. Founder-Market Fit
${answerById(answers, "founder_background", "Founder-market fit still needs a sharper explanation of lived experience, customer access, and unfair insight.")}

## 10. Founder Psychology
${answerById(answers, "founder_motivation", "Founder motivation and operating style still need to be made explicit.")}

## 11. First Wedge
${answerById(answers, "smallest_version", angle.firstVersion)}

## 12. Market Opportunity
Start with the narrow group that feels the pain most often. If usage and payment are proven, expand into adjacent workflows or nearby customer segments.

## 13. Competitive Landscape
The first competitors are current workarounds, generic tools, internal habits, and status quo behavior.

## 14. Business Model
${angle.whoMightPay} could pay through a subscription, paid pilot, service package, or per-workflow fee if the product saves time, reduces risk, or improves outcomes.

## 15. MVP Scope
${angle.firstVersion}

## 16. Go-To-Market Plan
Start founder-led. Contact the first 5 to 10 people most likely to react, show the smallest version, and ask what would make it worth paying for.

## 17. Validation Plan
Talk to target users, test a landing page, show a mockup, offer a concierge version, and ask for a paid pilot or concrete commitment.

## 18. Risks and Assumptions
${answerById(answers, "could_be_wrong", "The idea could be wrong if the pain is not frequent, not urgent, or not tied to a buyer.")}

## 19. Next 30 Days
${angle.recommendedNextStep}`;
}

function acceleratorAnswers(scan: BusinessScan, angle: BusinessAngle, answers: ProofCheckAnswer[]) {
  const rows = [
    ["What are you building?", angle.oneLineDescription],
    ["Who needs this?", answerById(answers, "who_cares", angle.whoItHelps)],
    [
      "What problem or opportunity are you addressing?",
      `${scan.observationInput.observationText} ${answerById(answers, "cost", "The cost and urgency still need to be proven.")}`
    ],
    [
      "How do you know people might want this?",
      answerById(answers, "evidence", "The first evidence is the repeated observation. The next evidence must come from customer conversations.")
    ],
    ["What exists today?", answerById(answers, "current_workaround", scan.currentWorkaround)],
    ["Who are your competitors or alternatives?", "Current workarounds, generic tools, manual effort, and existing habits."],
    ["How will it make money?", `${angle.whoMightPay} could pay if the product proves a clear time, cost, or outcome improvement.`],
    [
      "Why are you a good person to explore this?",
      answerById(
        answers,
        "founder_background",
        answerById(answers, "seen_personally", "You noticed the pattern early. Founder-market fit improves if you have direct access to the people affected.")
      )
    ],
    ["What founder-market fit do you have?", answerById(answers, "founder_background", "Founder-market fit still needs proof.")],
    ["What is your risk posture?", answerById(answers, "founder_risk_tolerance", "Risk boundaries still need to be named.")],
    ["What is the first version?", answerById(answers, "smallest_version", angle.firstVersion)],
    ["What is the next milestone?", angle.recommendedNextStep]
  ];

  return rows.map(([question, answer]) => `### ${question}\n${answer}`).join("\n\n");
}

function faq(scan: BusinessScan, angle: BusinessAngle, answers: ProofCheckAnswer[]) {
  const rows = [
    ["Why now?", answerById(answers, "why_now", "The why-now case needs direct customer evidence.")],
    ["Why would anyone pay?", answerById(answers, "who_pays", angle.whoMightPay)],
    ["Why hasn't this been solved?", "The problem may be hidden inside manual workarounds, small habits, or niche workflows that broad tools ignore."],
    ["What is the first wedge?", answerById(answers, "smallest_version", angle.firstVersion)],
    ["What is the biggest risk?", answerById(answers, "could_be_wrong", "The biggest risk is that the pain is real but not urgent enough to pay for.")],
    ["How do you get first users?", answerById(answers, "first_people", "Start with the people closest to the observation and ask for concrete reactions.")],
    ["How could this become large?", "If the first wedge proves repeat usage and willingness to pay, expansion can move into adjacent workflows and nearby customers."],
    ["What proof exists?", answerById(answers, "evidence", "Proof is early and should be collected through interviews, pilots, and usage.")],
    ["What proof is missing?", answerById(answers, "what_proves_real", "Missing proof includes willingness to pay, repeat usage, and buyer urgency.")],
    ["What would funding or support be used for?", "Support would be used to build the first version, run pilots, collect evidence, and test a repeatable go-to-market path."]
  ];

  return rows.map(([question, answer]) => `### ${question}\n${answer}`).join("\n\n");
}

function buildBrief(angle: BusinessAngle) {
  return `## Product summary
${angle.oneLineDescription}

## User roles
${list(["Guest or target user", "Buyer or account owner", "Admin/operator"])}

## Core user flow
${list(["Open the product", "Describe or create the core workflow item", "Add the minimum useful details", "See missing information or next action", "Export, share, or complete the workflow"])}

## Pages/screens
${list(["Landing or intake", "Dashboard", "Core workflow detail", "Status or results view", "Settings"])}

## Feature list
${list(["Simple intake", "Workflow tracker", "Status labels", "Notes and evidence", "Share/export summary"])}

## Data objects
${list(["User", "Workspace", "Customer", "Workflow item", "Task", "Evidence", "Share link"])}

## Must-have features
${list(["One narrow workflow", "Clear status", "Editable records", "Exportable summary", "Mobile-friendly UI"])}

## Nice-to-have later
${list(["Integrations", "Team roles", "Automations", "Analytics", "Billing"])}

## What not to build yet
${list(["Full platform", "Marketplace", "Complex permissions", "Unproven integrations", "Advanced AI automation"])}

## UI direction
Quiet, focused, credible, and practical. The first user should understand what to do without a tutorial.

## Acceptance criteria
${list(["A target user can complete the first workflow in under 5 minutes.", "The product makes missing information visible.", "The founder can measure whether the workflow creates value.", "The MVP can be used in a real pilot."])}`;
}

function pathPlan(path: ReturnType<typeof analyzeFounderFitEngine>["validationPath"]) {
  const plans: Record<ReturnType<typeof analyzeFounderFitEngine>["validationPath"], string[]> = {
    "interview-first": ["Send 10 direct interview requests", "Run 5 discovery calls", "Extract exact words and current workarounds"],
    "prototype-first": ["Build a clickable or lightweight prototype", "Watch 5 users try it", "Log technical unknowns and must-have workflow steps"],
    "audience-first": ["Publish the observation", "Collect replies and signups", "Invite the warmest responders into a manual proof sprint"],
    "client-first": ["Package a narrow paid pilot", "Ask 5 likely buyers for a concrete reaction", "Record price objections and commitment signals"],
    "expert-first": ["Interview 5 domain peers", "Map insider workflow constraints", "Ask one trusted expert to review the first wedge"],
    "email-first": ["Send 5 low-pressure messages", "Ask one concrete question", "Use replies to choose the next proof step"]
  };

  return plans[path];
}

function validationSprint(angle: BusinessAngle, engine: ReturnType<typeof analyzeFounderFitEngine>) {
  return `## Recommended path
${engine.validationPath}

## Why this path fits
${engine.adaptation.angleStrategy}

## Founder-specific proof moves
${list(pathPlan(engine.validationPath))}

## 14-day plan
${list(["Talk to 10 target users", "Write down current workarounds and exact phrases", "Create a one-page landing page", "Show a simple mockup", "Test pricing with the buyer", "Offer a manual or concierge version", "Write the founder-market fit narrative and test whether customers believe it"])}

## 30-day plan
${list(["Build a clickable prototype", "Get 3 expressions of interest", "Get 1 paid pilot if possible", "Improve the dossier with evidence", "Update the readiness score", "Update validation task statuses", `Decide whether to continue, narrow, or change ${angle.name}`])}`;
}

function videoScript(scan: BusinessScan, angle: BusinessAngle, answers: ProofCheckAnswer[]) {
  return `I noticed ${scan.observationInput.observationText.toLowerCase()} It matters because ${answerById(answers, "cost", "it creates repeated friction, wasted time, or confusion").toLowerCase()} The people most affected are ${answerById(answers, "who_cares", angle.whoItHelps).toLowerCase()} Today they use ${answerById(answers, "current_workaround", scan.currentWorkaround).toLowerCase()} I'm exploring ${angle.name}, ${angle.oneLineDescription.toLowerCase()} The first version would ${answerById(answers, "smallest_version", angle.firstVersion).toLowerCase()} The next step is to prove ${angle.recommendedNextStep.toLowerCase()}`;
}

function outreachEmail(scan: BusinessScan, angle: BusinessAngle) {
  return `Subject: Quick feedback on ${angle.name}

Hi [Name],

I noticed a pattern: ${scan.observationInput.observationText}

I am exploring ${angle.name}: ${angle.oneLineDescription}

Before building too much, I am trying to understand whether this is a real enough problem for ${angle.whoItHelps}.

Would you be open to a 15-minute conversation or a quick reply with how you handle this today?

Thanks,
[Your name]`;
}

function proofCheckSection(answers: ProofCheckAnswer[]) {
  return answers
    .map((answer) => `### ${answer.question}\n${answer.answer || "Not answered yet."}\n\nSignal: ${answer.signal}`)
    .join("\n\n");
}

function readinessSection(score: ReturnType<typeof calculateStartupReadinessScore>) {
  return `# Startup Readiness Score: ${score.total}/100

Status: ${score.label}

## Category scores
${list([
  `Observation clarity: ${score.categories.observationClarity}/8`,
  `Customer specificity: ${score.categories.customerSpecificity}/10`,
  `Buyer clarity: ${score.categories.buyerClarity}/10`,
  `Current workaround clarity: ${score.categories.currentWorkaroundClarity}/8`,
  `MVP clarity: ${score.categories.mvpClarity}/8`,
  `Validation evidence: ${score.categories.validationEvidence}/12`,
  `Founder-market fit: ${score.categories.founderMarketFit}/10`,
  `Founder psychology: ${score.categories.founderPsychology}/8`,
  `Risk awareness: ${score.categories.riskAwareness}/8`,
  `Go-to-market clarity: ${score.categories.goToMarketClarity}/8`,
  `Next-step clarity: ${score.categories.nextStepClarity}/10`
])}

## Strong signals
${score.strongSignals.length ? list(score.strongSignals) : "- Strong signals are still developing."}

## Weak signals
${score.weakSignals.length ? list(score.weakSignals) : "- No major weak signals detected."}

## Missing proof
${score.missingProof.length ? list(score.missingProof) : "- Pricing and repeat usage still need live proof."}

## Next actions
${list(score.nextActions)}`;
}

function founderPsychologySection(profile: ReturnType<typeof analyzeFounderPsychology>) {
  return `# Founder Psychology Engine

Score: ${profile.total}/100
Status: ${profile.label}

## Dimensions
${list([
  `Motivation: ${profile.dimensions.motivation}/20`,
  `Risk tolerance: ${profile.dimensions.riskTolerance}/20`,
  `Decision clarity: ${profile.dimensions.decisionClarity}/20`,
  `Execution habits: ${profile.dimensions.executionHabits}/20`,
  `Learning loop: ${profile.dimensions.learningLoop}/20`
])}

## Primary motivation
${profile.primaryMotivation}

## Decision style
${profile.decisionStyle}

## Risk posture
${profile.riskPosture}

## Strengths
${profile.strengths.length ? list(profile.strengths) : "- No strong psychology signal yet."}

## Watchouts
${profile.watchouts.length ? list(profile.watchouts) : "- No major watchouts yet."}

## Operating rules
${list(profile.operatingRules)}`;
}

function founderMarketFitSection(profile: ReturnType<typeof analyzeFounderMarketFit>) {
  return `# Founder-Market Fit Extraction

Score: ${profile.total}/100
Status: ${profile.label}

## Narrative
${profile.narrative}

## Dimensions
${list([
  `Lived experience: ${profile.dimensions.livedExperience}/20`,
  `Customer access: ${profile.dimensions.customerAccess}/20`,
  `Unfair insight: ${profile.dimensions.unfairInsight}/20`,
  `Credibility: ${profile.dimensions.credibility}/20`,
  `Persistence: ${profile.dimensions.persistence}/20`
])}

## Strengths
${profile.strengths.length ? list(profile.strengths) : "- Founder-market fit is still forming."}

## Gaps
${profile.gaps.length ? list(profile.gaps) : "- No major founder-market fit gaps detected."}

## Proof to collect
${profile.proofToCollect.length ? list(profile.proofToCollect) : "- Keep collecting direct customer proof and update this section."}`;
}

function founderFitEngineSection(profile: ReturnType<typeof analyzeFounderFitEngine>) {
  return `# Founder Fit Engine

Score: ${profile.fitScore}/100
Status: ${profile.label}

## Founder profile layer
Primary archetype: ${profile.primaryArchetype}

All detected archetypes:
${list(profile.archetypes)}

## Founder insight layer
${list(profile.insightTypes)}

## Founder behaviour layer
Mode: ${profile.behaviourMode}

Communication style: ${profile.communicationStyle}

Validation path: ${profile.validationPath}

## Founder fit layer
${list([
  `Domain fit: ${profile.dimensions.domainFit}/10`,
  `Credibility fit: ${profile.dimensions.credibilityFit}/10`,
  `Insight fit: ${profile.dimensions.insightFit}/10`,
  `Customer access: ${profile.dimensions.customerAccess}/10`,
  `Validation ability: ${profile.dimensions.validationAbility}/10`,
  `Build or brief ability: ${profile.dimensions.buildOrBriefAbility}/10`,
  `Reach ability: ${profile.dimensions.reachAbility}/10`,
  `Emotional commitment: ${profile.dimensions.emotionalCommitment}/10`,
  `Network advantage: ${profile.dimensions.networkAdvantage}/10`,
  `Execution readiness: ${profile.dimensions.executionReadiness}/10`
])}

## Strong signals
${profile.strongSignals.length ? list(profile.strongSignals) : "- Strong founder fit signals still need proof."}

## Weak signals
${profile.weakSignals.length ? list(profile.weakSignals) : "- No major founder fit weak signals detected."}

## Adaptation layer
Angle strategy: ${profile.adaptation.angleStrategy}

Proof check mode: ${profile.adaptation.proofQuestionMode}

Dossier tone: ${profile.adaptation.dossierTone}

Share emphasis:
${list([
  `Investor mode: ${profile.adaptation.shareEmphasis.investor.join(", ")}`,
  `Builder mode: ${profile.adaptation.shareEmphasis.builder.join(", ")}`,
  `Accelerator mode: ${profile.adaptation.shareEmphasis.accelerator.join(", ")}`
])}`;
}

const dataRoomChecklist = [
  "Founder bio",
  "Founder psychology profile",
  "Founder-market fit narrative",
  "One-page snapshot",
  "Full dossier",
  "Mockup",
  "Landing page",
  "User interview notes",
  "Waitlist",
  "LOIs",
  "Prototype",
  "Market notes",
  "Competitor notes",
  "Validation results"
];

const section = (
  type: DossierSection["type"],
  title: string,
  content: string,
  order: number
): DossierSection => ({
  id: uid("section"),
  type,
  title,
  content,
  order,
  updatedAt: new Date().toISOString()
});

function missingProofItems(score: ReturnType<typeof calculateStartupReadinessScore>): MissingProofItem[] {
  const items = score.missingProof.length
    ? score.missingProof
    : ["Pricing evidence", "Repeat usage", "A named first buyer"];

  return items.map((item, index) => ({
    id: uid("proof"),
    title: item,
    description: "Collect evidence before treating this as broadly sendable.",
    priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
    completed: false
  }));
}

function validationPathTask(engine: ReturnType<typeof analyzeFounderFitEngine>): ValidationTask {
  const pathTasks: Record<ReturnType<typeof analyzeFounderFitEngine>["validationPath"], ValidationTask> = {
    "interview-first": {
      id: uid("task"),
      title: "Run founder-fit interviews",
      description: "Interview people in the first customer segment and test whether your founder story earns trust.",
      phase: "14-day",
      status: "todo",
      evidenceHint: "Capture exact quotes about the problem and whether your background makes the test credible."
    },
    "prototype-first": {
      id: uid("task"),
      title: "Prototype the wedge",
      description: "Build the smallest clickable or working version that proves the core workflow.",
      phase: "14-day",
      status: "todo",
      evidenceHint: "Watch users try it and record where they hesitate, ask for more, or misunderstand."
    },
    "audience-first": {
      id: uid("task"),
      title: "Test with audience or community",
      description: "Share the observation with a warm audience and invite people into a manual proof sprint.",
      phase: "14-day",
      status: "todo",
      evidenceHint: "Track replies, signups, DMs, shares, and people asking for the next step."
    },
    "client-first": {
      id: uid("task"),
      title: "Pitch a paid pilot",
      description: "Package the smallest useful outcome and ask likely buyers for a real commitment.",
      phase: "14-day",
      status: "todo",
      evidenceHint: "Track price, objections, decision-maker, timeline, and whether they commit."
    },
    "expert-first": {
      id: uid("task"),
      title: "Pressure-test with domain experts",
      description: "Ask trusted domain insiders whether the workflow, buyer, and risk assumptions are real.",
      phase: "14-day",
      status: "todo",
      evidenceHint: "Capture corrections, insider constraints, and who they would introduce you to."
    },
    "email-first": {
      id: uid("task"),
      title: "Send low-pressure validation messages",
      description: "Send a short message to people close to the problem and ask one concrete question.",
      phase: "14-day",
      status: "todo",
      evidenceHint: "Save replies and use them to choose the next call, mockup, or pilot."
    }
  };

  return pathTasks[engine.validationPath];
}

function validationTasks(angle: BusinessAngle, engine: ReturnType<typeof analyzeFounderFitEngine>): ValidationTask[] {
  return [
    validationPathTask(engine),
    {
      id: uid("task"),
      title: "Talk to target users",
      description: `Interview people who match: ${angle.whoItHelps}`,
      phase: "14-day",
      status: "todo",
      evidenceHint: "Add names, roles, and exact quotes from at least 10 conversations."
    },
    {
      id: uid("task"),
      title: "Map current workarounds",
      description: "Write down what people do today, what breaks, and what they wish was easier.",
      phase: "14-day",
      status: "todo",
      evidenceHint: "Collect screenshots, notes, tools used, and repeated phrases."
    },
    {
      id: uid("task"),
      title: "Show a mockup",
      description: `Mock up the first version: ${angle.firstVersion}`,
      phase: "14-day",
      status: "todo",
      evidenceHint: "Record objections, moments of interest, and what they expected to happen next."
    },
    {
      id: uid("task"),
      title: "Test founder-market fit story",
      description: "Explain why you are the right person to explore this and see whether the audience trusts it.",
      phase: "14-day",
      status: "todo",
      evidenceHint: "Note which parts made people trust you and which felt generic."
    },
    {
      id: uid("task"),
      title: "Ask for commitment",
      description: "Ask for a paid pilot, LOI, waitlist signup, or next meeting.",
      phase: "30-day",
      status: "todo",
      evidenceHint: "Track yes/no answers, price reaction, and what commitment they actually made."
    },
    {
      id: uid("task"),
      title: "Update dossier with evidence",
      description: "Edit the dossier sections after each validation sprint so the score reflects reality.",
      phase: "30-day",
      status: "todo",
      evidenceHint: "Paste direct quotes, proof, objections, and changed assumptions into the dossier."
    },
    {
      id: uid("task"),
      title: "Decide continue, narrow, or stop",
      description: `Use the evidence to decide whether to continue, narrow, or change ${angle.name}.`,
      phase: "30-day",
      status: "todo",
      evidenceHint: "Make the decision from proof, not momentum."
    }
  ];
}

export function generateStartupDossier(
  scan: BusinessScan,
  selectedAngle: BusinessAngle,
  proofAnswers: ProofCheckAnswer[]
): StartupDossier {
  const readinessScore = calculateStartupReadinessScore(scan.observationInput, selectedAngle, proofAnswers);
  const founderFitEngine = analyzeFounderFitEngine(scan.observationInput, selectedAngle, proofAnswers);
  const founderPsychology = analyzeFounderPsychology(proofAnswers);
  const founderMarketFit = analyzeFounderMarketFit(scan.observationInput, selectedAngle, proofAnswers);
  const startupName = generateStartupName(scan, selectedAngle);
  const now = new Date().toISOString();
  const sections: DossierSection[] = [
    section("snapshot", "One-page Business Snapshot", snapshot(scan, selectedAngle, proofAnswers, founderFitEngine), 1),
    section("full_dossier", "Full Startup Dossier", fullDossier(scan, selectedAngle, proofAnswers, founderFitEngine), 2),
    section("founder_fit_engine", "Founder Fit Engine", founderFitEngineSection(founderFitEngine), 3),
    section("founder_market_fit", "Founder-Market Fit", founderMarketFitSection(founderMarketFit), 4),
    section("founder_psychology", "Founder Psychology", founderPsychologySection(founderPsychology), 5),
    section("accelerator_answers", "Accelerator-style Answers", acceleratorAnswers(scan, selectedAngle, proofAnswers), 6),
    section("faq", "Investor/Advisor FAQ", faq(scan, selectedAngle, proofAnswers), 7),
    section("proof_check", "Proof Check", proofCheckSection(proofAnswers), 8),
    section("readiness_score", "Startup Readiness Score", readinessSection(readinessScore), 9),
    section("mvp_build_brief", "MVP Build Brief", buildBrief(selectedAngle), 10),
    section("validation_sprint", "Validation Sprint", validationSprint(selectedAngle, founderFitEngine), 11),
    section("founder_video_script", "Founder Video Script", videoScript(scan, selectedAngle, proofAnswers), 12),
    section("outreach_email", "Outreach Email", outreachEmail(scan, selectedAngle), 13),
    section("data_room_checklist", "Data Room Checklist", list(dataRoomChecklist), 14),
    section("missing_proof", "Missing Proof", list(readinessScore.missingProof.length ? readinessScore.missingProof : ["Pricing evidence", "Repeat usage", "A named first buyer"]), 15)
  ];

  return {
    id: uid("dossier"),
    scanId: scan.id,
    sourceObservation: scan.observationInput.observationText,
    selectedAngle,
    startupName,
    slug: slugify(startupName),
    oneLiner: generateOneLiner(selectedAngle),
    status: readinessScore.total >= 75 ? "Strong opportunity signal" : readinessScore.total >= 60 ? "Business angle found" : "Interesting but needs more proof",
    readinessScore,
    founderFitEngine,
    founderPsychology,
    founderMarketFit,
    sections,
    proofAnswers,
    missingProofItems: missingProofItems(readinessScore),
    validationTasks: validationTasks(selectedAngle, founderFitEngine),
    shareLinks: [],
    createdAt: now,
    updatedAt: now
  };
}
