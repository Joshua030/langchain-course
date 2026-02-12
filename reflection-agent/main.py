# Step 1: Import dependencies
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from chains import generate_chain, reflect_chain
from dotenv import load_dotenv

# Step 2: Load environment variables (API keys, etc.)
load_dotenv()

# Step 3: Define the graph state schema — messages list with a reducer that appends new messages
class MessageGraph (TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

# Step 4: Define node name constants
REFLECT = "reflect"
GENERATE = "generate"

# Step 5: Define the generation node — calls the LLM to produce a draft response
def generation_node(state: MessageGraph):
    return {"messages": generate_chain.invoke({"messages": state["messages"]})}

# Step 6: Define the reflection node — critiques the generated response and returns feedback as a HumanMessage
def reflection_node(state: MessageGraph):
    res = reflect_chain.invoke({"messages": state["messages"]})
    return {"messages": [HumanMessage(content=res.content)]}

# Step 7: Create the StateGraph builder with the defined schema
builder = StateGraph(MessageGraph)

# Step 8: Add the generate and reflect nodes to the graph
builder.add_node(GENERATE, generation_node)
builder.add_node(REFLECT, reflection_node)

# Step 9: Set the entry point — the graph starts at the GENERATE node
builder.set_entry_point(GENERATE)

# Step 10: Define the conditional edge — stop after 6 messages, otherwise keep reflecting
def should_continue(state: MessageGraph):
    if len(state["messages"]) > 6:
        return END
    return REFLECT

# Step 11: Wire the edges — GENERATE decides next step, REFLECT always loops back to GENERATE
builder.add_conditional_edges(GENERATE, should_continue, path_map={END: END, REFLECT: REFLECT})
builder.add_edge(REFLECT, GENERATE)

# Step 12: Compile the graph into a runnable and print its mermaid diagram
graph = builder.compile()
print(graph.get_graph().draw_mermaid())



if __name__ == "__main__":
    print("Hello from reflection-agent!")