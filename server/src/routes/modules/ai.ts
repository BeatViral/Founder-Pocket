import type { Router } from "express";
import { stub } from "../../lib/routeStub.js";

export function registerAIRoutes(router: Router) {
  stub(router, "post", "/ai/generate-scan", "Generate observation scan through server AI provider");
  stub(router, "post", "/ai/generate-angles", "Generate business angles through server AI provider");
  stub(router, "post", "/ai/generate-proof-questions", "Generate proof questions through server AI provider");
  stub(router, "post", "/ai/generate-dossier", "Generate dossier through server AI provider");
  stub(router, "post", "/ai/regenerate-section", "Regenerate dossier section through server AI provider");
  stub(router, "post", "/ai/founder-fit-analysis", "Run founder fit analysis through server AI provider");
}
