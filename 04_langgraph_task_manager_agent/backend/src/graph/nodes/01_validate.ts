// first node after start node
// user input validation

import { State } from "../types";

export async function validateInputNode(state: State): Promise<State> {
  const rawInput = state.input;
  const trimmedInput = rawInput.trim();

  if (trimmedInput.length === 0) {
    return {
      ...state,
      message: "Input cannot be empty. Please provide a valid input.",
      status: "cancelled",
    };
  }

  if (trimmedInput.length < 5) {
    return {
      ...state,
      message: "Input must be at least 5 characters long.",
      status: "cancelled",
    };
  }

  const MAX = 300;
  const safeINput =
    trimmedInput.length > MAX
      ? trimmedInput.slice(0, MAX) + "..."
      : trimmedInput;

  return {
    ...state,
    input: safeINput,
  };
}
