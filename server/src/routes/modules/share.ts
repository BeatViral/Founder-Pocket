import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerShareRoutes(router: Router) {
  stub(router, "post", "/dossiers/:dossierId/share", "Create public share link");
  stub(router, "get", "/share/:token", "Read public shared dossier");
  stub(router, "patch", "/share/:shareId", "Update share link");
  stub(router, "delete", "/share/:shareId", "Deactivate share link");
  stub(router, "post", "/share/:token/view", "Record share link view");
}
