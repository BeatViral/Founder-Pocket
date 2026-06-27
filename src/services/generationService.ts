import { calculateBusinessPotentialScore, calculateStartupReadinessScore, signalForAnswer } from "./scoringService";
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
  "Prepare something to send or pitch"
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
    return [
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
    ];
  }

  if (d === "music") {
    return [
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
    ];
  }

  if (d === "education") {
    return [
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
    ];
  }

  if (d === "tradie") {
    return [
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
    ];
  }

  if (d === "restaurant") {
    return [
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
    ];
  }

  const observation = input.observationText.replace(/\.$/, "");
  return [
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
  ];
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

export function generateProofCheckQuestions(): ProofCheckQuestion[] {
  return [
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
      id: "evidence",
      question: "Do you have any evidence already?",
      helperText: "Mention direct conversations, repeated examples, payment, screenshots, customer requests, or notes."
    }
  ];
}

export function createProofAnswers(raw: Record<string, string>): ProofCheckAnswer[] {
  return generateProofCheckQuestions().map((question) => ({
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

function snapshot(scan: BusinessScan, angle: BusinessAngle, answers: ProofCheckAnswer[]) {
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

## Business model
${angle.businessType} with a narrow paid pilot, subscription, service package, or usage-based path depending on the buyer.

## Current proof
${answerById(answers, "evidence", "Current proof is mostly the original observation and needs direct customer evidence.")}

## Missing proof
${answerById(answers, "what_proves_real", "Missing proof includes urgency, willingness to pay, and repeat usage.")}

## Next milestone
${angle.recommendedNextStep}`;
}

function fullDossier(scan: BusinessScan, angle: BusinessAngle, answers: ProofCheckAnswer[]) {
  return `## 1. Executive Summary
${angle.name} is a business worth exploring from the observation: "${scan.observationInput.observationText}" ${angle.oneLineDescription}

## 2. Original Observation
${scan.observationInput.observationText}

## 3. Business Insight
${scan.interpretation}

## 4. Problem or Opportunity
${answerById(answers, "cost", "The opportunity is to reduce repeated pain, wasted time, confusion, risk, or manual effort.")}

## 5. Target Customer
${answerById(answers, "who_cares", angle.whoItHelps)}

## 6. Current Workarounds
${answerById(answers, "current_workaround", scan.currentWorkaround)}

## 7. Product Thesis
${angle.oneLineDescription} The product should begin with one narrow workflow and avoid acting like a full platform too early.

## 8. First Wedge
${answerById(answers, "smallest_version", angle.firstVersion)}

## 9. Market Opportunity
Start with the narrow group that feels the pain most often. If usage and payment are proven, expand into adjacent workflows or nearby customer segments.

## 10. Competitive Landscape
The first competitors are current workarounds, generic tools, internal habits, and status quo behavior.

## 11. Business Model
${angle.whoMightPay} could pay through a subscription, paid pilot, service package, or per-workflow fee if the product saves time, reduces risk, or improves outcomes.

## 12. MVP Scope
${angle.firstVersion}

## 13. Go-To-Market Plan
Start founder-led. Contact the first 5 to 10 people most likely to react, show the smallest version, and ask what would make it worth paying for.

## 14. Validation Plan
Talk to target users, test a landing page, show a mockup, offer a concierge version, and ask for a paid pilot or concrete commitment.

## 15. Risks and Assumptions
${answerById(answers, "could_be_wrong", "The idea could be wrong if the pain is not frequent, not urgent, or not tied to a buyer.")}

## 16. Next 30 Days
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
      answerById(answers, "seen_personally", "You noticed the pattern early. Founder fit improves if you have direct access to the people affected.")
    ],
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

function validationSprint(angle: BusinessAngle) {
  return `## 14-day plan
${list(["Talk to 10 target users", "Write down current workarounds and exact phrases", "Create a one-page landing page", "Show a simple mockup", "Test pricing with the buyer", "Offer a manual or concierge version"])}

## 30-day plan
${list(["Build a clickable prototype", "Get 3 expressions of interest", "Get 1 paid pilot if possible", "Improve the dossier with evidence", "Update the readiness score", `Decide whether to continue, narrow, or change ${angle.name}`])}`;
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
  `Observation clarity: ${score.categories.observationClarity}/10`,
  `Customer specificity: ${score.categories.customerSpecificity}/12`,
  `Buyer clarity: ${score.categories.buyerClarity}/12`,
  `Current workaround clarity: ${score.categories.currentWorkaroundClarity}/10`,
  `MVP clarity: ${score.categories.mvpClarity}/10`,
  `Validation evidence: ${score.categories.validationEvidence}/12`,
  `Founder fit: ${score.categories.founderFit}/9`,
  `Risk awareness: ${score.categories.riskAwareness}/8`,
  `Go-to-market clarity: ${score.categories.goToMarketClarity}/8`,
  `Next-step clarity: ${score.categories.nextStepClarity}/9`
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

const dataRoomChecklist = [
  "Founder bio",
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

function validationTasks(angle: BusinessAngle): ValidationTask[] {
  return [
    {
      id: uid("task"),
      title: "Talk to target users",
      description: `Interview people who match: ${angle.whoItHelps}`,
      phase: "14-day",
      status: "todo"
    },
    {
      id: uid("task"),
      title: "Show a mockup",
      description: `Mock up the first version: ${angle.firstVersion}`,
      phase: "14-day",
      status: "todo"
    },
    {
      id: uid("task"),
      title: "Ask for commitment",
      description: "Ask for a paid pilot, LOI, waitlist signup, or next meeting.",
      phase: "30-day",
      status: "todo"
    }
  ];
}

export function generateStartupDossier(
  scan: BusinessScan,
  selectedAngle: BusinessAngle,
  proofAnswers: ProofCheckAnswer[]
): StartupDossier {
  const readinessScore = calculateStartupReadinessScore(scan.observationInput, selectedAngle, proofAnswers);
  const startupName = generateStartupName(scan, selectedAngle);
  const now = new Date().toISOString();
  const sections: DossierSection[] = [
    section("snapshot", "One-page Business Snapshot", snapshot(scan, selectedAngle, proofAnswers), 1),
    section("full_dossier", "Full Startup Dossier", fullDossier(scan, selectedAngle, proofAnswers), 2),
    section("accelerator_answers", "Accelerator-style Answers", acceleratorAnswers(scan, selectedAngle, proofAnswers), 3),
    section("faq", "Investor/Advisor FAQ", faq(scan, selectedAngle, proofAnswers), 4),
    section("proof_check", "Proof Check", proofCheckSection(proofAnswers), 5),
    section("readiness_score", "Startup Readiness Score", readinessSection(readinessScore), 6),
    section("mvp_build_brief", "MVP Build Brief", buildBrief(selectedAngle), 7),
    section("validation_sprint", "Validation Sprint", validationSprint(selectedAngle), 8),
    section("founder_video_script", "Founder Video Script", videoScript(scan, selectedAngle, proofAnswers), 9),
    section("outreach_email", "Outreach Email", outreachEmail(scan, selectedAngle), 10),
    section("data_room_checklist", "Data Room Checklist", list(dataRoomChecklist), 11),
    section("missing_proof", "Missing Proof", list(readinessScore.missingProof.length ? readinessScore.missingProof : ["Pricing evidence", "Repeat usage", "A named first buyer"]), 12)
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
    sections,
    proofAnswers,
    missingProofItems: missingProofItems(readinessScore),
    validationTasks: validationTasks(selectedAngle),
    shareLinks: [],
    createdAt: now,
    updatedAt: now
  };
}
