import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerValidationRoutes(router: Router) {
  stub(router, "get", "/dossiers/:dossierId/validation", "List validation tasks");
  stub(router, "post", "/dossiers/:dossierId/validation/tasks", "Create validation task");
  stub(router, "patch", "/validation/tasks/:taskId", "Update validation task");
  stub(router, "delete", "/validation/tasks/:taskId", "Delete validation task");
}
