export const env = {
  PORT: Number(process.env.PORT ?? 8787),
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-only-change-me",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  AI_PROVIDER: process.env.AI_PROVIDER ?? "mock",
  AI_MODEL: process.env.AI_MODEL ?? "mock-founder-pocket",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? ""
};
