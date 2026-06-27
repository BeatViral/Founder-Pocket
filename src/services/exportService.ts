import { analyticsService } from "./analyticsService";
import type { StartupDossier } from "../types";

export const exportService = {
  async printPdf(dossier: StartupDossier, exportType = "full_dossier") {
    await analyticsService.track("pdf_exported", { dossierId: dossier.id, exportType });
    window.print();
  },

  async downloadJson(dossier: StartupDossier) {
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dossier.slug}-dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async downloadExportPack(dossier: StartupDossier) {
    const sections = dossier.sections.map((section) => `# ${section.title}\n\n${section.content}`).join("\n\n---\n\n");
    const payload = [
      `Founder Pocket Export Pack`,
      `Startup: ${dossier.startupName}`,
      `Generated: ${new Date().toISOString()}`,
      "",
      sections
    ].join("\n");
    const blob = new Blob([payload], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dossier.slug}-export-pack.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
