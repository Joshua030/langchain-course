# Reflection Agent

A LangGraph-based reflection agent that generates viral tweets by iteratively drafting and self-critiquing using an LLM. The agent loops between a **generation** step and a **reflection** step, improving the tweet on each pass until a maximum number of iterations is reached.

## How It Works

1. The user provides an initial topic or tweet idea.
2. The **Generate** node drafts a tweet using the LLM.
3. The **Reflect** node critiques the draft and provides recommendations (length, tone, style).
4. The critique is fed back as a `HumanMessage` so the generator treats it as user feedback.
5. Steps 2-4 repeat until the message count exceeds 6, then the graph ends.

```
[User Input] -> GENERATE -> REFLECT -> GENERATE -> REFLECT -> ... -> END
```

## Project Structure

```
reflection-agent/
├── main.py      # Graph definition, nodes, edges, and conditional routing
├── chains.py    # LLM prompt templates and chain definitions
└── README.md
```

## Key LangChain Concepts

### ChatPromptTemplate
Builds structured prompts with system instructions and dynamic message placeholders. Used here to define the personality and behavior for both the generator and the critic.

### MessagesPlaceholder
A slot inside a prompt template that gets filled with a list of messages at runtime. This allows the chains to receive the full conversation history on each invocation.

### LCEL (LangChain Expression Language)
The `prompt | llm` pipe syntax composes a prompt template and an LLM into a single runnable chain. This is the standard way to build chains in LangChain.

### ChatOpenAI
The LLM wrapper that calls OpenAI's chat completion API. Configured via environment variables (`OPENAI_API_KEY`).

## Key LangGraph Concepts

### StateGraph
The core building block of LangGraph. It defines a graph where each node is a function that reads and writes to a shared **state** object. Unlike simple chains, a `StateGraph` supports cycles, conditional branching, and multiple execution paths.

### State Schema (TypedDict)
The graph state is defined as a `TypedDict`. Each key represents a piece of data that nodes can read and update. Here the state holds a single `messages` list.

### Annotated Reducer (`add_messages`)
The `Annotated[list[BaseMessage], add_messages]` pattern attaches a **reducer** to the `messages` field. Instead of replacing the list on each update, `add_messages` appends new messages to the existing list, preserving conversation history.

### Nodes
Functions registered with `builder.add_node()`. Each node receives the current state and returns a partial state update. In this project:
- **generate** — calls the generation chain and returns the AI's draft.
- **reflect** — calls the reflection chain and wraps the critique as a `HumanMessage`.

### Edges
Define the flow between nodes:
- **`add_edge(A, B)`** — unconditional transition from A to B.
- **`add_conditional_edges(A, fn, path_map)`** — routes from A based on the return value of `fn`. Here it checks message count to decide between continuing to `REFLECT` or stopping at `END`.

### Entry Point
`set_entry_point(GENERATE)` tells the graph which node to execute first.

### END
A special sentinel that signals the graph to stop execution and return the final state.

### Compile
`builder.compile()` transforms the graph definition into an executable runnable that can be invoked with `.invoke()` or `.stream()`.
