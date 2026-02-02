import { ChatOpenAI } from "@langchain/openai";
import z from "zod";
import { env } from "../../utils/env";
import { State } from "../types";

const PlanSchema = z.object({
  step: z
    .array(
      z
        .string()
        .min(3, "Keep each step concise")
        .max(150, "Each step should be under 150 characters"),
    )
    .max(30, "Maximum of 30 steps allowed")
    .min(1, "At least one step is required"),
});

type Plan = z.infer<typeof PlanSchema>;

function makeModel() {
  return new ChatOpenAI({
    apiKey: env.OPENAI_API_KEY,
    temperature: 0.2,
    model: env.OPEN_API_MODEL || "gpt-3.5-turbo",
  });
}

const SYSTEM_PROMPT = [
  `You are a helpful planner.`,
  "Return only JSON that matches the given schema.",
  "keep steps concrete, actionable and beginner friendly",
].join("\n");

function userPrompt(input: string): string {
  return [
    `User goal: "${input}"`,
    "Draft a small plan with 3-5 steps",
    "Make sure the steps are detailed and easy to follow for a beginner.",
  ].join("\n");
}

function takeFirstN<T>(arr: T[], n: number = 5): T[] {
  return Array.isArray(arr) ? arr.slice(0, Math.max(0, n)) : [];
}

export async function PlanNode(state: State): Promise<Partial<State>> {
  if (state.status === "cancelled") return {};
  const model = makeModel();

  const structured = model.withStructuredOutput(PlanSchema);

  const plan = await structured.invoke([
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "human",
      content: `${userPrompt(state.input)}`,
    },
  ]);

  const steps = takeFirstN<string>(plan.step, 5);

  return { steps, status: "planned" };
}
