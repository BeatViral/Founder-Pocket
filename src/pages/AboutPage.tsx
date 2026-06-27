import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Badge tone="info">About Founder Pocket</Badge>
      <h1 className="mt-5 text-4xl font-black md:text-6xl">From "I noticed something" to "here is a business worth exploring."</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card tone="light" className="p-6">
          <h2 className="text-2xl font-bold text-slate-950">The front door is curiosity.</h2>
          <p className="mt-3 leading-7 text-slate-600">
            You do not need a startup idea, investor language, or a pitch deck. You start with
            something you noticed in work, life, customers, hobbies, health, music, local business,
            or the world around you.
          </p>
        </Card>
        <Card tone="light" className="p-6">
          <h2 className="text-2xl font-bold text-slate-950">The output is serious.</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Founder Pocket scans the observation, generates business angles, checks proof, and
            creates a startup dossier with a build brief, validation sprint, share links, and export actions.
          </p>
        </Card>
      </div>
      <Card className="mt-8 p-6">
        <h2 className="text-2xl font-bold">What it is not</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">
          It is not a funding promise, not a random idea generator, and not a claim that every
          observation should become a company. It is a structured way to ask: is there a real
          problem, a specific customer, a buyer, a small first version, and proof worth collecting?
        </p>
      </Card>
      <Link to="/scan" className="mt-8 inline-flex">
        <Button>Start with an observation</Button>
      </Link>
    </main>
  );
}
