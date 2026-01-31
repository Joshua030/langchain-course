import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { env } from "./env";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";

type ModelOptions = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
};

export function getChatModel(opts: ModelOptions = {}): BaseChatModel {
  const temp = opts.temperature ?? 0.2;

  switch (env.MODEL_PROVIDER) {
    case "gemini":
      return new ChatGoogleGenerativeAI({
        temperature: temp,
        model: env.GOOGLE_MODEL,
      });

    case "groq":
      return new ChatGroq({
        temperature: temp,
        model: env.GROQ_MODEL,
      });

    case "openai":
      return new ChatOpenAI({ temperature: temp, model: env.OPENAI_MODEL });

    default:
      return new ChatGoogleGenerativeAI({
        temperature: temp,
        model: env.GOOGLE_MODEL,
      });
  }
}
