import { ArrowRight, CheckCircle2, FileText, LockKeyhole, ScanSearch, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

type Plan = {
  name: string;
  price: string;
  cadence?: string;
  badge?: string;
  description: string;
  cta: string;
  to: string;
  featured?: boolean;
  includes: string[];
};

const plans: Plan[] = [
  {
    name: "Explorer",
    price: "Free",
    description: "For testing observations.",
    cta: "Start Free",
    to: "/scan",
    includes: [
      "3 Business Scans/month",
      "Basic business angles",
      "Basic Business Potential Score",
      "Limited Proof Check preview",
      "Preview Startup Dossier",
      "No public share links",
      "No branded PDF export"
    ]
  },
  {
    name: "Founder Pack",
    price: "$29",
    cadence: "one-time",
    description: "For turning one promising observation into a serious startup dossier.",
    cta: "Build One Dossier",
    to: "/signup",
    includes: [
      "10 Business Scans",
      "1 full Startup Dossier",
      "Full Proof Check",
      "Founder Fit Score",
      "Startup Readiness Score",
      "Editable dossier sections",
      "PDF export",
      "Builder brief",
      "Accelerator answers",
      "Investor/advisor FAQ",
      "1 public share link"
    ]
  },
  {
    name: "Pro",
    price: "$49",
    cadence: "/month",
    badge: "Best for serious founders",
    description: "For active founders building and validating multiple ideas.",
    cta: "Build and Validate",
    to: "/signup",
    featured: true,
    includes: [
      "100 Business Scans/month",
      "25 Startup Dossiers/month",
      "Advanced Founder Fit Engine",
      "Adaptive Proof Check",
      "Validation Tracker",
      "Branded PDF exports",
      "Investor, Builder, and Accelerator share modes",
      "Share analytics",
      "Section regeneration",
      "Export packs",
      "Dashboard workspace"
    ]
  },
  {
    name: "Studio",
    price: "$99",
    cadence: "/month",
    badge: "Coming soon",
    description: "For coaches, consultants, incubators, venture studios, and agencies.",
    cta: "Join Waitlist",
    to: "/signup",
    includes: [
      "Client workspaces",
      "Custom PDF branding",
      "High-volume scans and dossiers",
      "Team features",
      "Template controls",
      "Advanced analytics"
    ]
  }
];

const usageItems = [
  "A Business Scan checks one observation for business potential.",
  "A Startup Dossier turns one selected business angle into a complete proof-checked startup document.",
  "Exports and share links are included on paid plans.",
  "AI usage may be subject to fair-use limits."
];

const paywallItems = [
  "Guests can run a free scan.",
  "Users must create an account to save, edit, export, or share.",
  "Free users can preview a dossier.",
  "Paid users can unlock full dossiers, PDF export, public share links, and validation tracking."
];

const faqs = [
  {
    question: "Can I try it free?",
    answer: "Yes. The Explorer plan is designed for trying a small number of observations before deciding whether a dossier is worth unlocking."
  },
  {
    question: "What is a Business Scan?",
    answer: "A Business Scan checks one observation for signals like repeated pain, existing workarounds, possible buyers, proof gaps, and business potential."
  },
  {
    question: "What is a Startup Dossier?",
    answer: "A Startup Dossier turns a selected business angle into a structured document with proof checks, founder fit, readiness scoring, build notes, validation steps, and shareable sections."
  },
  {
    question: "Do I need to be a founder already?",
    answer: "No. Founder Pocket starts with something you noticed. It helps you decide whether there is a business angle worth taking more seriously."
  },
  {
    question: "Can I export a PDF?",
    answer: "PDF export is planned for paid plans. The current app supports browser print/save-as-PDF, and the pricing model prepares for branded PDF export."
  },
  {
    question: "Can I share with investors or builders?",
    answer: "Yes. Paid plans are designed to include share modes for investors/advisors, builders, and accelerators, with public links and analytics when backend sharing is enabled."
  },
  {
    question: "Does this guarantee funding?",
    answer: "No. Founder Pocket does not guarantee funding, accelerator acceptance, customers, or startup success."
  },
  {
    question: "Will there be team plans?",
    answer: "Yes. Studio is planned for coaches, consultants, incubators, venture studios, agencies, and teams that need multiple workspaces or client-facing outputs."
  }
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div className="max-w-4xl">
          <Badge tone="info">Free scan. Paid dossier. Pro workspace.</Badge>
          <h1 className="mt-5 text-4xl font-black md:text-6xl">
            Start free. Upgrade when an observation becomes worth building.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Founder Pocket helps you scan things you've noticed for business potential, then turn the
            strongest opportunities into proof-checked startup dossiers you can save, share, export,
            build from, or pitch.
          </p>
        </div>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-signal">
              <ScanSearch size={20} />
            </span>
            <div>
              <p className="text-sm font-black text-white">Pricing-ready, payments later</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                No real payment provider is connected yet. These plans define the product usage model.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <InfoPanel
          icon={<FileText size={20} />}
          title="How usage works"
          items={usageItems}
        />
        <InfoPanel
          icon={<LockKeyhole size={20} />}
          title="Future paywall logic"
          items={paywallItems}
        />
      </section>

      <section className="mt-10">
        <Card className="p-6 md:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-signal">
              <ShieldCheck size={22} />
            </span>
            <div className="max-w-4xl">
              <h2 className="text-2xl font-black">What Founder Pocket does not promise</h2>
              <p className="mt-3 leading-7 text-slate-300">
                Founder Pocket does not guarantee funding, acceptance into accelerators, or startup success.
                It helps you clarify, proof-check, validate, and present business opportunities more seriously.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge tone="neutral">FAQ</Badge>
            <h2 className="mt-3 text-3xl font-black">Common questions</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question} className="p-5">
              <h3 className="text-lg font-black">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-lg border border-white/16 bg-white/[0.075] p-8 shadow-premium ring-1 ring-white/[0.04] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="text-3xl font-black">Start with something you've noticed.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Run the first scan free. If the signal is strong, the dossier gives you a more serious next step.
            </p>
          </div>
          <Link to="/scan">
            <Button icon={<ArrowRight size={18} />}>Scan for Business</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function PricingCard({ plan }: { plan: Plan }) {
  const isLight = Boolean(plan.featured);

  return (
    <Card tone={isLight ? "light" : "glass"} className="flex min-h-[650px] flex-col p-5">
      <div className="min-h-[192px]">
        <div className="flex min-h-8 items-start justify-between gap-3">
          <h2 className={isLight ? "text-2xl font-black text-slate-950" : "text-2xl font-black text-white"}>
            {plan.name}
          </h2>
          {plan.badge ? (
            <span className={isLight ? "rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-900" : "rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-black text-slate-100"}>
              {plan.badge}
            </span>
          ) : null}
        </div>
        <div className="mt-6 flex items-end gap-2">
          <p className={isLight ? "text-4xl font-black text-slate-950" : "text-4xl font-black text-white"}>{plan.price}</p>
          {plan.cadence ? (
            <p className={isLight ? "pb-1 text-sm font-black text-slate-500" : "pb-1 text-sm font-black text-slate-400"}>
              {plan.cadence}
            </p>
          ) : null}
        </div>
        <p className={isLight ? "mt-4 text-sm font-semibold leading-6 text-slate-600" : "mt-4 text-sm font-semibold leading-6 text-slate-300"}>
          {plan.description}
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.includes.map((feature) => (
          <li key={feature} className={isLight ? "flex gap-3 text-sm font-semibold text-slate-700" : "flex gap-3 text-sm font-semibold text-slate-300"}>
            <CheckCircle2 className={isLight ? "mt-0.5 shrink-0 text-cyan-600" : "mt-0.5 shrink-0 text-signal"} size={17} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link to={plan.to} className="mt-auto pt-8">
        <Button fullWidth variant={isLight ? "primary" : "secondary"} icon={<ArrowRight size={17} />}>
          {plan.cta}
        </Button>
      </Link>
    </Card>
  );
}

function InfoPanel({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-signal">
          {icon}
        </span>
        <h2 className="text-2xl font-black">{title}</h2>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-300">
            <CheckCircle2 className="mt-1 shrink-0 text-signal" size={17} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
