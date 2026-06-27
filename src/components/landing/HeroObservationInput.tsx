import { ArrowRight } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { exampleObservations } from "../../services/generationService";
import { Button } from "../ui/Button";

export function HeroObservationInput() {
  const navigate = useNavigate();
  const [observation, setObservation] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!observation.trim()) return;
    navigate("/scan", { state: { observationText: observation } });
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-white/12 bg-white/[0.07] p-3 shadow-panel">
      <label className="mb-2 block px-1 text-sm font-semibold text-slate-200">What have you noticed?</label>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <textarea
          value={observation}
          onChange={(event) => setObservation(event.target.value)}
          placeholder="I keep noticing that..."
          className="min-h-32 w-full resize-none rounded-md border border-white/10 bg-slate-950/70 px-4 py-4 text-base leading-7 text-white outline-none placeholder:text-slate-500 focus:border-signal focus:ring-2 focus:ring-signal/20"
        />
        <Button type="submit" className="h-full min-h-14 md:w-44" icon={<ArrowRight size={18} />}>
          Scan for Business
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {exampleObservations.slice(0, 5).map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setObservation(item)}
            className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs text-slate-300 transition hover:border-signal/50 hover:text-white"
          >
            {item}
          </button>
        ))}
      </div>
    </form>
  );
}
