import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerDossierRoutes(router: Router) {
  stub(router, "post", "/dossiers", "Create startup dossier");
  stub(router, "get", "/dossiers", "List startup dossiers");
  stub(router, "get", "/dossiers/:id", "Read startup dossier");
  stub(router, "patch", "/dossiers/:id", "Update startup dossier");
  stub(router, "delete", "/dossiers/:id", "Delete startup dossier");
  stub(router, "patch", "/dossiers/:dossierId/sections/:sectionId", "Update dossier section");
  stub(router, "post", "/dossiers/:dossierId/sections/:sectionId/regenerate", "Regenerate dossier section via AI provider");
  stub(router, "post", "/dossiers/:dossierId/export/pdf", "Create PDF export");
  stub(router, "post", "/dossiers/:dossierId/export/json", "Create JSON export");
  stub(router, "get", "/dossiers/:dossierId/export-pack", "Download export pack");
}
