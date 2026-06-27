import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function NotFoundPage() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 py-16">
      <Card className="p-8 text-center">
        <h1 className="text-4xl font-black">Page not found</h1>
        <p className="mt-3 text-slate-300">Start with an observation and run a fresh scan.</p>
        <Link to="/" className="mt-6 inline-flex">
          <Button>Go home</Button>
        </Link>
      </Card>
    </main>
  );
}
