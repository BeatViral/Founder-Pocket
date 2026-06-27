import { Card } from "../components/ui/Card";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Card className="p-8">
        <h1 className="text-4xl font-black">Privacy</h1>
        <p className="mt-4 leading-7 text-slate-300">
          Founder Pocket currently runs in local/demo mode. Scans, dossiers, share links, and analytics events are stored in your browser unless a backend is connected.
        </p>
        <p className="mt-4 leading-7 text-slate-300">
          Production mode should store user data in the configured backend, protect private dossiers, and keep AI provider keys server-side.
        </p>
      </Card>
    </main>
  );
}
