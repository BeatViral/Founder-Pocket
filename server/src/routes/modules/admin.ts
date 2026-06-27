import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerAdminRoutes(router: Router) {
  stub(router, "get", "/admin/metrics", "Read admin metrics");
  stub(router, "get", "/admin/users", "List users");
  stub(router, "get", "/admin/dossiers", "List dossiers");
  stub(router, "get", "/admin/events", "List analytics events");
  stub(router, "get", "/admin/ai-jobs", "List AI jobs");
  stub(router, "patch", "/admin/settings", "Update admin settings");
}
