import { dossierService } from "./dossierService";
import type { ShareLink, ShareMode, SharedDossierResult, StartupDossier } from "../types";

const randomToken = (seed: string) =>
  `${seed}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-5)}`;

const id = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

function withUpdatedShareLink(dossier: StartupDossier, link: ShareLink): StartupDossier {
  const existing = dossier.shareLinks.some((item) => item.id === link.id);
  return {
    ...dossier,
    shareLinks: existing
      ? dossier.shareLinks.map((item) => (item.id === link.id ? link : item))
      : [...dossier.shareLinks, link]
  };
}

export const shareService = {
  async createShareLink(dossierId: string, mode: ShareMode, expiresAt?: string): Promise<ShareLink | undefined> {
    const dossier = await dossierService.getDossier(dossierId);
    if (!dossier) return undefined;

    const activeExisting = dossier.shareLinks.find((link) => link.mode === mode && link.isActive);
    if (activeExisting) return activeExisting;

    const link: ShareLink = {
      id: id(),
      dossierId,
      shareToken: randomToken(`${dossier.slug}-${mode}`),
      mode,
      isActive: true,
      expiresAt,
      viewCount: 0,
      createdAt: new Date().toISOString()
    };

    await dossierService.updateDossier(withUpdatedShareLink(dossier, link));
    return link;
  },

  async setShareActive(dossierId: string, linkId: string, isActive: boolean) {
    const dossier = await dossierService.getDossier(dossierId);
    if (!dossier) return undefined;

    const updated = {
      ...dossier,
      shareLinks: dossier.shareLinks.map((link) =>
        link.id === linkId ? { ...link, isActive } : link
      )
    };

    await dossierService.updateDossier(updated);
    return updated.shareLinks.find((link) => link.id === linkId);
  },

  async updateShareLink(dossierId: string, linkId: string, patch: Partial<ShareLink>) {
    const dossier = await dossierService.getDossier(dossierId);
    if (!dossier) return undefined;

    const updated = {
      ...dossier,
      shareLinks: dossier.shareLinks.map((link) =>
        link.id === linkId ? { ...link, ...patch } : link
      )
    };

    await dossierService.updateDossier(updated);
    return updated.shareLinks.find((link) => link.id === linkId);
  },

  async getSharedDossier(shareToken: string): Promise<SharedDossierResult | undefined> {
    const dossiers = await dossierService.listDossiers();
    for (const dossier of dossiers) {
      const shareLink = dossier.shareLinks.find(
        (link) =>
          link.shareToken === shareToken &&
          link.isActive &&
          (!link.expiresAt || new Date(link.expiresAt).getTime() > Date.now())
      );
      if (shareLink) return { dossier, shareLink };
    }

    return undefined;
  },

  async recordView(shareToken: string): Promise<SharedDossierResult | undefined> {
    const result = await this.getSharedDossier(shareToken);
    if (!result) return undefined;

    const updatedLink = {
      ...result.shareLink,
      viewCount: (result.shareLink.viewCount ?? 0) + 1
    };
    const updatedDossier = withUpdatedShareLink(result.dossier, updatedLink);
    await dossierService.updateDossier(updatedDossier);
    return { dossier: updatedDossier, shareLink: updatedLink };
  }
};
