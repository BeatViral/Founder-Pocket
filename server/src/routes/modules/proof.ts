import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerProofRoutes(router: Router) {
  stub(router, "post", "/proof-check/:angleId", "Create proof check");
  stub(router, "get", "/proof-check/:id", "Read proof check");
  stub(router, "patch", "/proof-check/:id", "Update proof check");
}
