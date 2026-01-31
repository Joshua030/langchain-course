import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { loadEnv } from "./env";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

export type Provider = "openai" | "gemini" | "groq";

export function createChatModel(): {
  provider: Provider;
  model: BaseChatModel;
} {
  loadEnv();

  const forcedProvider = process.env.PROVIDER as Provider | undefined;
  const hasOpenAIApiKey = Boolean(process.env.OPENAI_API_KEY);
  const hasGeminiApiKey = Boolean(process.env.GOOGLE_API_KEY);
  const hasGroqApiKey = Boolean(process.env.GROQ_API_KEY);

  const base = { temperature: 0 };

  if (
    forcedProvider === "openai" ||
    (forcedProvider === undefined && hasOpenAIApiKey)
  ) {
    return {
      provider: "openai",
      model: new ChatOpenAI({ ...base, modelName: "gpt-4o-mini" }),
    };
  }

  if (
    forcedProvider === "gemini" ||
    (forcedProvider === undefined && hasGeminiApiKey)
  ) {
    return {
      provider: "gemini",
      model: new ChatGoogleGenerativeAI({
        ...base,
        model: "gemini-3-flash-preview",
      }),
    };
  }

  if (
    forcedProvider === "groq" ||
    (forcedProvider === undefined && hasGroqApiKey)
  ) {
    return {
      provider: "groq",
      model: new ChatGroq({
        ...base,
        model: "llama-3.3-70b-versatile",
      }),
    };
  }

  return {
    provider: "gemini",
    model: new ChatGoogleGenerativeAI({
      ...base,
      model: "gemini-3-flash-preview",
    }),
  };
}
