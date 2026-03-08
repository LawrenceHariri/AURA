import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export const MODELS = {
  chat: process.env.OPENAI_MODEL || "gpt-4o",
  embedding: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  whisper: process.env.OPENAI_WHISPER_MODEL || "whisper-1",
} as const;
