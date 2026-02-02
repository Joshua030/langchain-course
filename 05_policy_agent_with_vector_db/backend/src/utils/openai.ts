// model instance talk to our model

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { env } from "process";

export const chatModel = new ChatOpenAI({
  openAIApiKey: env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.2,
});

export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_KEY,
  model: "text-embedding-3-small",
});
