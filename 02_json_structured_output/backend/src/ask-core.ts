import { createChatModel } from "./lc-model";
import { AskResult, AskResultSchema } from "./schema";

export async function askStructured(query: string): Promise<AskResult> {
  const { model } = createChatModel();

  // Keeep instructions brief so that schema stays visible in the model

  const systemPrompt = `You are an AI assistant that provides concise and accurate answers based on the provided context. Respond in JSON format according to the specified schema.`;
  const user =
    `Summarize for a beginner: \n` +
    `"${query}" \n` +
    `Return fields: summary (short paragraph), confidence (0 to 1).`;

  // Use structured output with zod schema
  const structured = model.withStructuredOutput<AskResult>(AskResultSchema);

  // Invoke the model
  const result = await structured.invoke([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: user,
    },
  ]);

  return result;
}
