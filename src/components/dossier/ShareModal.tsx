import { useState } from "react";
import { shareModeLabels } from "../../lib/format";
import { analyticsService } from "../../services/analyticsService";
import { shareService } from "../../services/shareService";
import type { ShareMode, StartupDossier } from "../../types";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export function ShareModal({
  dossier,
  open,
  onClose,
  onUpdated
}: {
  dossier: StartupDossier;
  open: boolean;
  onClose: () => void;
  onUpdated: (dossier: StartupDossier) => void;
}) {
  const [mode, setMode] = useState<ShareMode>("full");
  const [link, setLink] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const create = async () => {
    const shareLink = await shareService.createShareLink(dossier.id, mode, expiresAt ? new Date(expiresAt).toISOString() : undefined);
    if (!shareLink) return;
    const path = mode === "full" ? `/share/${shareLink.shareToken}` : `/share/${shareLink.shareToken}/${mode}`;
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${window.location.origin}${basePath}${path}`;
    setLink(url);
    await navigator.clipboard.writeText(url);
    await analyticsService.track("share_link_created", { dossierId: dossier.id, mode });
    const refreshed = await shareService.getSharedDossier(shareLink.shareToken);
    if (refreshed) onUpdated(refreshed.dossier);
  };

  return (
    <Modal open={open} title="Share dossier" onClose={onClose}>
      <p className="mb-4 text-sm leading-6 text-slate-300">
        Only share information you are comfortable making visible.
      </p>
      <p className="mb-4 rounded-md border border-amber-300/20 bg-amber-400/10 p-3 text-sm leading-6 text-amber-100">
        Demo share links are stored locally. Real public links require backend storage.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(shareModeLabels) as ShareMode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-md border px-3 py-3 text-left text-sm transition ${
              mode === item
                ? "border-signal bg-signal/12 text-white"
                : "border-white/12 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
            }`}
          >
            {shareModeLabels[item]}
          </button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-semibold text-slate-200">Optional expiry date</span>
        <input
          type="date"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          className="mt-2 w-full rounded-md border border-white/12 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-signal"
        />
      </label>
      <Button className="mt-5" fullWidth onClick={create}>
        Create and copy link
      </Button>
      {dossier.shareLinks.length ? (
        <div className="mt-5 space-y-2">
          <h3 className="text-sm font-bold">Existing links</h3>
          {dossier.shareLinks.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.05] p-3 text-sm">
              <span>{shareModeLabels[item.mode]} · {item.viewCount ?? 0} views</span>
              <button
                type="button"
                onClick={async () => {
                  const updated = await shareService.setShareActive(dossier.id, item.id, !item.isActive);
                  if (updated) {
                    onUpdated({
                      ...dossier,
                      shareLinks: dossier.shareLinks.map((linkItem) => (linkItem.id === updated.id ? updated : linkItem))
                    });
                  }
                }}
                className="text-signal hover:text-cyan-200"
              >
                {item.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {link ? (
        <div className="mt-4 rounded-md border border-white/12 bg-slate-950 p-3 text-sm text-slate-300">
          {link}
        </div>
      ) : null}
    </Modal>
  );
}
