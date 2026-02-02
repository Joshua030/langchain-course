// Define the state that flows through the graph
// GRAPH = STATE + NODES _+ EDGES
// Each node can read from and write to this state

import z from "zod";

// planned -> plan is readty but not yet approved
// done -> task is already executed and final result prepared
// cancelled -> in this case user rejected the flow, we stop grace

export const ExecutionStatus = z.enum(["planned", "done", "cancelled"]);
export type ExecutionStatus = z.infer<typeof ExecutionStatus>;

// step result
// each executed step can produce a short and human readable outcome
export const StepResultSchema = z.object({
  step: z.string(),
  note: z.string(),
});

// state -> zod schema
export const StateSchema = z.object({
  input: z.string().min(5, "Input is required"),
  steps: z.array(z.string()).optional(),
  approved: z.boolean().optional(),
  results: z.array(StepResultSchema).optional(),
  status: ExecutionStatus.optional(),
  message: z.string().optional(),
});

export type State = z.infer<typeof StateSchema>;

// Initial state helper

export const createInitialState = (input: string): State => ({
  input,
  status: "planned",
});
