import { ChatOpenAI } from "@langchain/openai";
import { env } from "process";
import z from "zod";
import { State } from "../types";

const NoteSchema = z.object({
  notes: z.array(z.string().min(1).max(500)).min(1).max(20),
});

type Notes = z.infer<typeof NoteSchema>;

function makeModel() {
  return new ChatOpenAI({
    apiKey: env.OPENAI_API_KEY,
    temperature: 0.2,
    model: env.OPEN_API_MODEL || "gpt-3.5-turbo",
  });
}

export function createHumanPromptContent(steps: string[]): string {
  const list = JSON.stringify(steps, null, 0);

  return [
    "You are a concise assistant.",
    'Given a list of steps, return a JSON object {"notes: string[] }',
    "Rules:",
    "notes.length must be equal to steps.length",
    "Each note should be a brief summary of the corresponding step.",
    "Each note should be under 300 words.",
    "PLain text no markdown.",
    "Make notes clear and beginner friendly.",
    `Steps: ${list}`,
  ].join("\n");
}

export async function ExecuteNode(state: State): Promise<Partial<State>> {
  if (!state.approved || state.status === "cancelled") return {};

  const steps = state.steps || [];
  if (steps.length === 0) {
    return {
      message: "No steps available to execute.",
      status: "cancelled",
    };
  }

  const model = makeModel();
  const structured = model.withStructuredOutput(NoteSchema);

  const out: Notes = await structured.invoke([
    {
      role: "system",
      content: `Return only valid JSON matching the schema.`,
    },
    {
      role: "human",
      content: createHumanPromptContent(steps),
    },
  ]);

  const count = Math.min(out.notes.length, steps.length);
  const results = Array.from({ length: count }, (_, i) => ({
    step: steps[i],
    note: out.notes[i],
  }));

  return {
    results,
    status: "done",
    message: `Execution completed successfully. ${results.length} steps executed.`,
  };
}
