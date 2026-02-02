// role -> pause the graph and wait for user approval

import { State } from "../types";

// per run helper passed by langgraph in the node context
// interrupt({stpers: string[]}) -> pauses the graph and waits for user input

export async function ApproveNode(
  state: State,
  context: any,
): Promise<Partial<State>> {
  if (state.status === "cancelled") return {};

  const steps = state.steps || [];
  if (steps.length === 0) {
    return {
      message: "No steps available to approve.",
      status: "cancelled",
    };
  }

  const interrupt = context?.interrupt as (
    payload: unknown,
  ) => Promise<unknown>;

  const decision = await interrupt({
    type: "needs_approval",
    steps,
  });

  let approved: boolean;

  if (decision && typeof decision === "object" && "approved" in decision) {
    approved = Boolean((decision as any).approved);
  } else {
    approved = false;
  }

  return {
    approved,
  };
}
