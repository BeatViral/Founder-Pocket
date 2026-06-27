import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const plans = [
  {
    name: "Free MVP",
    price: "$0",
    note: "Available now",
    description: "For turning observations into business angles and a first startup dossier.",
    action: "Start a free scan",
    to: "/scan",
    featured: true,
    features: [
      "Observation scan",
      "Business angle generator",
      "Proof Check",
      "Founder Fit card",
      "Startup dossier",
      "Dashboard saves",
      "Copy actions and print PDF"
    ]
  },
  {
    name: "Builder",
    price: "Coming soon",
    note: "For active validation",
    description: "For people testing multiple ideas, proof loops, and shareable build briefs.",
    action: "Create account",
    to: "/signup",
    featured: false,
    features: [
      "More saved dossiers",
      "Validation sprint tracking",
      "Public share links",
      "Export packs",
      "Founder profile memory",
      "Advanced readiness scoring"
    ]
  },
  {
    name: "Studio",
    price: "Coming soon",
    note: "For teams and cohorts",
    description: "For builders, studios, and accelerators reviewing many startup opportunities.",
    action: "View how it works",
    to: "/how-it-works",
    featured: false,
    features: [
      "Shared workspaces",
      "Cohort dashboards",
      "Accelerator-style outputs",
      "Reviewer share modes",
      "Admin analytics",
      "Custom export templates"
    ]
  }
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="max-w-3xl">
        <Badge tone="info">Pricing</Badge>
        <h1 className="mt-5 text-4xl font-black md:text-6xl">Start free while Founder Pocket is in MVP.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          The current app is free to use. Billing is not active yet. Paid plans below show the direction
          for deeper validation, public sharing, team review, and accelerator workflows.
        </p>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} tone={plan.featured ? "light" : "glass"} className="flex min-h-[560px] flex-col p-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className={plan.featured ? "text-2xl font-black text-slate-950" : "text-2xl font-black text-white"}>
                  {plan.name}
                </h2>
                <span className={plan.featured ? "rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800" : "rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200"}>
                  {plan.note}
                </span>
              </div>
              <p className={plan.featured ? "mt-6 text-4xl font-black text-slate-950" : "mt-6 text-4xl font-black text-white"}>
                {plan.price}
              </p>
              <p className={plan.featured ? "mt-4 min-h-14 leading-7 text-slate-600" : "mt-4 min-h-14 leading-7 text-slate-300"}>
                {plan.description}
              </p>
            </div>

            <ul className="mt-7 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className={plan.featured ? "flex gap-3 text-sm text-slate-700" : "flex gap-3 text-sm text-slate-300"}>
                  <CheckCircle2 className={plan.featured ? "mt-0.5 shrink-0 text-cyan-600" : "mt-0.5 shrink-0 text-signal"} size={17} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link to={plan.to} className="mt-auto pt-8">
              <Button fullWidth variant={plan.featured ? "primary" : "secondary"} icon={<ArrowRight size={17} />}>
                {plan.action}
              </Button>
            </Link>
          </Card>
        ))}
      </section>

      <section className="mt-10 rounded-lg border border-white/12 bg-white/[0.06] p-6 md:p-8">
        <h2 className="text-2xl font-bold">What is active right now?</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">
          Founder Pocket currently supports the free MVP flow: observation input, business scan,
          angle selection, Proof Check, Founder Fit, startup dossier, dashboard saving, share modes,
          copy actions, and browser print/save-as-PDF. Stripe billing and plan limits are not switched on yet.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/scan">
            <Button>Try the free scan</Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary">Create account</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
