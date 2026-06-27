import { ArrowRight, CheckCircle2, ScanSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroObservationInput } from "../components/landing/HeroObservationInput";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { exampleObservations } from "../services/generationService";

export default function LandingPage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.14),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <Badge tone="info">Observation-to-business engine</Badge>
            <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
              Type something you've noticed. See if there's a business in it.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Founder Pocket turns everyday observations, patterns, frustrations, gaps,
              habits, and ideas into business angles you can explore, test, build, or pitch.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/scan">
                <Button icon={<ScanSearch size={18} />}>Scan for Business</Button>
              </Link>
              <Link to="/examples">
                <Button variant="secondary">See Examples</Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Not every observation is a business. Founder Pocket helps you find the ones that might be.
            </p>
          </div>
          <HeroObservationInput />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {exampleObservations.map((item) => (
            <Link
              key={item}
              to="/scan"
              state={{ observationText: item }}
              className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm text-slate-300 transition hover:border-signal/50 hover:text-white"
            >
              {item}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          ["1", "Write an observation", "Start with plain language. No startup idea or jargon required."],
          ["2", "Scan for signals", "Founder Pocket classifies pain, workarounds, buyers, and possible demand."],
          ["3", "Build the serious output", "The strongest angle becomes a proof check, dossier, build brief, and shareable pack."]
        ].map(([step, title, body]) => (
          <Card key={title} className="p-5">
            <div className="mb-5 grid h-10 w-10 place-items-center rounded-md bg-signal text-sm font-black text-slate-950">
              {step}
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Card tone="light" className="p-6">
          <Badge tone="info">Business scan preview</Badge>
          <h2 className="mt-4 text-3xl font-bold text-slate-950">From messy notice to business signals.</h2>
          <div className="mt-6 space-y-3">
            {["Repeated behaviour", "Pain point", "Workflow friction", "Hidden demand", "Admin burden"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md bg-slate-100 p-3 text-slate-700">
                <CheckCircle2 className="text-cyan-600" size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card tone="light" className="p-6">
          <Badge tone="violet">Startup dossier preview</Badge>
          <h2 className="mt-4 text-3xl font-bold text-slate-950">The serious pack comes after the scan.</h2>
          <p className="mt-4 leading-7 text-slate-600">
            Once an angle looks promising, Founder Pocket creates a snapshot, full dossier,
            structured answers, MVP build brief, validation sprint, video script, outreach email,
            and share-ready sections.
          </p>
          <Link to="/scan" className="mt-6 inline-flex">
            <Button icon={<ArrowRight size={18} />}>Try a scan</Button>
          </Link>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-white/12 bg-white/[0.06] p-8 md:p-10">
          <h2 className="text-3xl font-bold">Different from a random idea generator.</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Founder Pocket starts with something you actually noticed. It looks for repeated
            behaviour, workarounds, buyer logic, missing proof, and a small first version.
            The point is not fake confidence. The point is a clearer next step.
          </p>
          <Link to="/scan" className="mt-7 inline-flex">
            <Button>Scan your observation</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
