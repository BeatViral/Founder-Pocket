import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerObservationRoutes(router: Router) {
  stub(router, "post", "/observations", "Create observation");
  stub(router, "get", "/observations", "List observations");
  stub(router, "get", "/observations/:id", "Read observation");
  stub(router, "patch", "/observations/:id", "Update observation");
  stub(router, "delete", "/observations/:id", "Delete observation");
}
