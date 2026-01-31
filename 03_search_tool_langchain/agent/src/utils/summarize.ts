import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "../shared/model";
import { summarizeInputSchema, summarizeOutputSchema } from "./schemas";

export async function summarize(text: string) {
  // Validate input
  const { text: validatedText } = summarizeInputSchema.parse({ text });

  const clipped = clip(validatedText, 4000);

  const model = getChatModel({ temperature: 0.3, maxTokens: 500 });

  // Create prompt and invoke model
  const response = await model.invoke([
    new SystemMessage(
      [
        "You are a helpful assistant that summarizes text concisely.",
        "Guidelines:",
        "- Provide a concise summary of the provided text.",
        "- Focus on key points and main ideas.",
        "- Use clear and simple language.",
        "- Keep the summary under 100 words.",
        "Do not invent any information. Only summarize what is present in the text.",
        "keep it readable and engaging.",
      ].join(" \n"),
    ),
    new HumanMessage(
      [
        "Summarize the following content for a beginner, friendly audience.",
        "Focus on key facts and remove fluff",
        "TEXT:",
        clipped,
      ].join("\n\n"),
    ),
  ]);

  const rawModelOutput =
    typeof response.content === "string"
      ? response.content
      : String(response.content);

  const summary = normalizeSummary(rawModelOutput);

  return summarizeOutputSchema.parse({ summary });
}

function clip(text: string, maxTokens: number): string {
  const words = text.split(" ");
  if (words.length <= maxTokens) {
    return text;
  }
  return words.slice(0, maxTokens).join(" ");
}

function normalizeSummary(summary: string): string {
  // Remove excessive whitespace
  let normalized = summary.replace(/\s+/g, " ").trim();

  // Ensure it ends with a period
  if (!/[.!?]$/.test(normalized)) {
    normalized += ".";
  }

  return normalized.slice(0, 2500); // Cap to 2500 characters
}
