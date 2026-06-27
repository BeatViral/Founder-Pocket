import { Card } from "../components/ui/Card";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Card className="p-8">
        <h1 className="text-4xl font-black">Terms</h1>
        <p className="mt-4 leading-7 text-slate-300">
          Founder Pocket helps structure observations into business angles, proof checks, dossiers, validation plans, and exports. It does not guarantee success, acceptance, investment, or customer demand.
        </p>
        <p className="mt-4 leading-7 text-slate-300">
          Only share information you are comfortable making visible, especially while demo share links are local-mode placeholders.
        </p>
      </Card>
    </main>
  );
}
