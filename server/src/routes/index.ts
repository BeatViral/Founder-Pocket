import type { Express } from "express";
import { Router } from "express";
import { registerAdminRoutes } from "./modules/admin.js";
import { registerAIRoutes } from "./modules/ai.js";
import { registerAnalyticsRoutes } from "./modules/analytics.js";
import { registerAuthRoutes } from "./modules/auth.js";
import { registerDossierRoutes } from "./modules/dossiers.js";
import { registerObservationRoutes } from "./modules/observations.js";
import { registerProofRoutes } from "./modules/proof.js";
import { registerScanRoutes } from "./modules/scans.js";
import { registerShareRoutes } from "./modules/share.js";
import { registerUserRoutes } from "./modules/user.js";
import { registerValidationRoutes } from "./modules/validation.js";

export function registerRoutes(app: Express) {
  const router = Router();

  registerAuthRoutes(router);
  registerUserRoutes(router);
  registerObservationRoutes(router);
  registerScanRoutes(router);
  registerProofRoutes(router);
  registerDossierRoutes(router);
  registerValidationRoutes(router);
  registerShareRoutes(router);
  registerAIRoutes(router);
  registerAnalyticsRoutes(router);
  registerAdminRoutes(router);

  app.use("/api", router);
}
