import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerScanRoutes(router: Router) {
  stub(router, "post", "/scans", "Generate or persist business scan");
  stub(router, "get", "/scans", "List business scans");
  stub(router, "get", "/scans/:id", "Read business scan");
  stub(router, "delete", "/scans/:id", "Delete business scan");
  stub(router, "get", "/scans/:scanId/angles", "List angles for scan");
  stub(router, "post", "/angles/:angleId/select", "Select angle for proof/dossier flow");
}
