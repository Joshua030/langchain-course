// define the exact response shape we want from the agent

import { createAgent, providerStrategy } from "langchain";
import z from "zod";
import { chatModel } from "../utils/openai";
import { agentTools } from "./02_tools";
import { AGENT_SYSTEM_PROMPT } from "./01_policy";
import { any } from "zod/v4";

const AgentResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(
    z.object({
      source: z.string(),
      chunkId: z.number(),
      preview: z.string(),
    }),
  ),
});

export const productAgent = createAgent({
  model: chatModel,
  tools: agentTools,
  systemPrompt: AGENT_SYSTEM_PROMPT,
  responseFormat: providerStrategy(AgentResponseSchema),
});

export async function runProductAgent(
  messages: { role: string; content: string }[],
): Promise<{ answer: string; citations: any[] }> {
  const result: any = await productAgent.invoke({
    messages,
  });

  if (result?.structuredResponse) {
    return {
      answer: result.structuredResponse.answer,
      citations: result.structuredResponse.citations ?? [],
    };
  }

  // fallback in case structuredResponse is missing
  return {
    answer: "I don't know based on the available documentation.",
    citations: [],
  };
}
