import { Ban, CheckCircle2, Circle, Link as LinkIcon, ListChecks, PlayCircle } from "lucide-react";
import { analyticsService } from "../../services/analyticsService";
import { dossierService } from "../../services/dossierService";
import type { StartupDossier, ValidationTask } from "../../types";
import { Card } from "../ui/Card";
import { Input, Textarea } from "../ui/FormControls";

const statusOptions: Array<{
  value: ValidationTask["status"];
  label: string;
  icon: typeof Circle;
}> = [
  { value: "todo", label: "To do", icon: Circle },
  { value: "doing", label: "Doing", icon: PlayCircle },
  { value: "done", label: "Done", icon: CheckCircle2 },
  { value: "blocked", label: "Blocked", icon: Ban }
];

export function ValidationTracker({
  dossier,
  onUpdated
}: {
  dossier: StartupDossier;
  onUpdated: (dossier: StartupDossier) => void;
}) {
  const tasks = dossier.validationTasks ?? [];
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const updateStatus = async (taskId: string, status: ValidationTask["status"]) => {
    const updated = await dossierService.updateValidationTask(dossier.id, taskId, status);
    if (updated) onUpdated(updated);
    if (status === "done") await analyticsService.track("validation_task_completed", { dossierId: dossier.id, taskId });
  };

  const updateTask = async (taskId: string, patch: Partial<ValidationTask>) => {
    const updated = await dossierService.updateValidationTaskFields(dossier.id, taskId, patch);
    if (updated) onUpdated(updated);
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <ListChecks className="text-signal" size={20} />
        <div>
          <h2 className="font-bold">Validation tracker</h2>
          <p className="mt-1 text-xs text-slate-400">
            {doneCount}/{tasks.length} tasks complete
          </p>
        </div>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-signal" style={{ width: `${progress}%` }} />
      </div>
      <div className="mb-5 grid gap-2 text-xs text-slate-400">
        <span>Weekly proof summary: {doneCount ? `${doneCount} task signals collected.` : "No proof collected yet."}</span>
        <span>Decisions made: update each task with notes before changing the dossier.</span>
        <span>Next proof gap: {tasks.find((task) => task.status !== "done")?.title ?? "No open gap."}</span>
      </div>
      <div className="space-y-4">
        {(["14-day", "30-day"] as const).map((phase) => {
          const phaseTasks = tasks.filter((task) => task.phase === phase);
          if (!phaseTasks.length) return null;

          return (
            <section key={phase}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{phase}</h3>
              <div className="space-y-2">
                {phaseTasks.map((task) => (
                  <div key={task.id} className="rounded-md border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-sm font-semibold text-white">{task.title}</div>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{task.description}</p>
                    {task.evidenceHint ? (
                      <p className="mt-2 text-xs leading-5 text-slate-500">Evidence: {task.evidenceHint}</p>
                    ) : null}
                    <div className="mt-3 grid grid-cols-2 gap-1">
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        const active = task.status === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateStatus(task.id, option.value)}
                            className={`inline-flex min-h-9 items-center justify-center gap-1 rounded-md border px-2 text-xs font-semibold transition ${
                              active
                                ? "border-signal bg-signal/15 text-white"
                                : "border-white/10 bg-slate-950/50 text-slate-400 hover:text-white"
                            }`}
                            aria-pressed={active}
                          >
                            <Icon size={14} />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 grid gap-2">
                      <Textarea
                        value={task.notes ?? ""}
                        onChange={(event) => updateTask(task.id, { notes: event.target.value })}
                        placeholder="Notes, interview log, decisions made..."
                        className="min-h-20 text-xs"
                      />
                      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                        <Input
                          value={task.evidenceUrl ?? ""}
                          onChange={(event) => updateTask(task.id, { evidenceUrl: event.target.value })}
                          placeholder="Evidence link or file placeholder"
                          className="text-xs"
                        />
                        <div className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-xs text-slate-400">
                          <LinkIcon size={14} />
                          Evidence
                        </div>
                      </div>
                      {task.proofImpact || task.linkedReadinessCategory ? (
                        <p className="text-xs leading-5 text-slate-500">
                          Impact: {task.proofImpact ?? "Readiness proof"} · {task.linkedReadinessCategory ?? "general"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
