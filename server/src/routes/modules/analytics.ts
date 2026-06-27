import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerAnalyticsRoutes(router: Router) {
  stub(router, "post", "/analytics/events", "Record analytics event");
}
