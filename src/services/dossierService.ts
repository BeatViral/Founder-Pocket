import { storageService } from "./storageService";
import type { DossierSection, StartupDossier } from "../types";

export const dossierService = {
  listDossiers() {
    return storageService.listDossiers();
  },

  getDossier(id: string) {
    return storageService.getDossier(id);
  },

  saveDossier(dossier: StartupDossier) {
    return storageService.saveDossier(dossier);
  },

  updateDossier(dossier: StartupDossier) {
    return storageService.saveDossier({
      ...dossier,
      updatedAt: new Date().toISOString()
    });
  },

  async updateSection(dossierId: string, section: DossierSection) {
    const dossier = await storageService.getDossier(dossierId);
    if (!dossier) return undefined;

    const updatedSection = { ...section, updatedAt: new Date().toISOString() };
    const updated = {
      ...dossier,
      sections: dossier.sections.map((item) => (item.id === section.id ? updatedSection : item)),
      updatedAt: new Date().toISOString()
    };

    return storageService.saveDossier(updated);
  },

  deleteDossier(id: string) {
    return storageService.deleteDossier(id);
  }
};
