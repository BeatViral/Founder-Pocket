import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerAuthRoutes(router: Router) {
  stub(router, "post", "/auth/register", "Register user and create session/JWT");
  stub(router, "post", "/auth/login", "Login user and issue session/JWT");
  stub(router, "post", "/auth/logout", "Clear session/JWT");
  stub(router, "get", "/auth/me", "Return current authenticated user");
}
