import { Check, Copy, RefreshCw, SquarePen } from "lucide-react";
import { useState } from "react";
import type { DossierSection as DossierSectionType } from "../../types";
import { Button } from "../ui/Button";
import { Markdown } from "../ui/Markdown";

export function EditableSection({
  section,
  onSave
}: {
  section: DossierSectionType;
  onSave: (section: DossierSectionType) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.content);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(section.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const save = () => {
    onSave({ ...section, content: draft });
    setEditing(false);
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm print-section md:p-7">
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <Button variant="quiet" onClick={save} icon={<Check size={16} />}>
              Save
            </Button>
          ) : (
            <Button variant="quiet" onClick={() => setEditing(true)} icon={<SquarePen size={16} />}>
              Edit
            </Button>
          )}
          <Button variant="quiet" onClick={copy} icon={<Copy size={16} />}>
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="quiet" title="Placeholder for future AI regeneration" icon={<RefreshCw size={16} />}>
            Regenerate
          </Button>
        </div>
      </div>
      {editing ? (
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-[520px] w-full rounded-md border border-slate-300 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-900 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
        />
      ) : (
        <div className="prose-like">
          <Markdown content={section.content} />
        </div>
      )}
    </article>
  );
}
