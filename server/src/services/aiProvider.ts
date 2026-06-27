import { env } from "../lib/env.js";

export type AIProviderRequest = {
  prompt: string;
  input: unknown;
  jobType: string;
};

export type AIProviderResponse = {
  provider: string;
  model: string;
  output: unknown;
};

export async function runAIJob(request: AIProviderRequest): Promise<AIProviderResponse> {
  if (env.AI_PROVIDER === "mock" || (!env.OPENAI_API_KEY && !env.ANTHROPIC_API_KEY)) {
    return {
      provider: "mock",
      model: env.AI_MODEL,
      output: {
        jobType: request.jobType,
        note: "Mock AI response. Deterministic frontend generation remains active until a server provider is configured."
      }
    };
  }

  return {
    provider: env.AI_PROVIDER,
    model: env.AI_MODEL,
    output: {
      note: "Wire OpenAI/Anthropic SDK calls here. Keep API keys server-side only."
    }
  };
}
