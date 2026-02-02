// define and compile the langgrap workflow
// start agent run
//resem agent run

import {
  Annotation,
  Command,
  END,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { validateInputNode } from "./nodes/01_validate";
import { ApproveNode } from "./nodes/03_approve";
import { PlanNode } from "./nodes/02_plan";
import { ExecuteNode } from "./nodes/04_execute";
import { finalizeNode } from "./nodes/05_finalize";
import { createInitialState, State } from "./types";

const stateAnnotation = Annotation.Root({
  input: Annotation<string>,
  steps: Annotation<string[] | undefined>,
  approved: Annotation<boolean | undefined>,
  results: Annotation<{ step: string; note: string }[] | undefined>,
  status: Annotation<"planned" | "done" | "cancelled" | undefined>,
  message: Annotation<string | undefined>,
});

// linear path
// start => validate input => plan steps => approve steps => execute steps => finalize

const builder = new StateGraph(stateAnnotation)
  .addNode("validate", validateInputNode)
  .addNode("plan", PlanNode)
  .addNode("approve", ApproveNode)
  .addNode("execute", ExecuteNode)
  .addNode("finalize", finalizeNode);

builder.addEdge(START, "validate");
builder.addEdge("validate", "plan");
builder.addEdge("plan", "approve");

// from approve we can go to execute or finalize (if cancelled) -- Conditional edges
builder.addConditionalEdges(
  "approve",
  (state: typeof stateAnnotation.State) => {
    return state.approved === true ? ["execute"] : ["finalize"];
  },
);

builder.addEdge("execute", "finalize");
builder.addEdge("finalize", END);

const checkPointer = new MemorySaver();
const graph = builder.compile({
  checkpointer: checkPointer,
});

function createThreadId() {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

export async function startAgentRun(
  input: string,
): Promise<
  { interrupt: { threadId: string; steps: string[] } } | { final: State }
> {
  const threadId = createThreadId();

  const config = { configurable: { thread_id: threadId } };
  const result: any = await graph.invoke(createInitialState(input), config);

  if (result && result.__interrupt__) {
    const first = Array.isArray(result.__interrupt__)
      ? result.__interrupt__[0]
      : result.__interrupt__;

    const steps = (first?.value?.steps as string[]) || [];

    return {
      interrupt: {
        threadId,
        steps,
      },
    };
  }

  return { final: result as State };
}

export async function resumeAgentRun(args: {
  threadId: string;
  approved: boolean;
}): Promise<State> {
  const { threadId, approved } = args;

  const config = { configurable: { thread_id: threadId } };
  const finalState = await graph.invoke(
    new Command({
      resume: { approved },
    }),
    config,
  );

  return finalState as State;
}
