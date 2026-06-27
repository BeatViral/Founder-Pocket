import { storageService } from "./storageService";
import type { DossierSection, StartupDossier, ValidationTask } from "../types";

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

  async updateValidationTask(dossierId: string, taskId: string, status: ValidationTask["status"]) {
    const dossier = await storageService.getDossier(dossierId);
    if (!dossier) return undefined;

    const updated = {
      ...dossier,
      validationTasks: (dossier.validationTasks ?? []).map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
      updatedAt: new Date().toISOString()
    };

    return storageService.saveDossier(updated);
  },

  async updateValidationTaskFields(dossierId: string, taskId: string, patch: Partial<ValidationTask>) {
    const dossier = await storageService.getDossier(dossierId);
    if (!dossier) return undefined;

    const updated = {
      ...dossier,
      validationTasks: (dossier.validationTasks ?? []).map((task) =>
        task.id === taskId ? { ...task, ...patch } : task
      ),
      updatedAt: new Date().toISOString()
    };

    return storageService.saveDossier(updated);
  },

  deleteDossier(id: string) {
    return storageService.deleteDossier(id);
  }
};
