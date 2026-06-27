import cors from "cors";
import "dotenv/config";
import express from "express";
import { env } from "./lib/env.js";
import { registerRoutes } from "./routes/index.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mode: env.AI_PROVIDER === "mock" ? "mock" : "production-ready",
    storage: env.DATABASE_URL ? "database-configured" : "mock-only"
  });
});

registerRoutes(app);

app.listen(env.PORT, () => {
  console.log(`Founder Pocket API listening on http://localhost:${env.PORT}`);
});
