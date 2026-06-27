import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerUserRoutes(router: Router) {
  stub(router, "get", "/user/profile", "Read founder profile");
  stub(router, "patch", "/user/profile", "Update founder profile");
}
