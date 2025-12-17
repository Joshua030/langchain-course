from dotenv import load_dotenv
load_dotenv()

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI



@tool
def search(query: str) -> str:
    # Simulate a search operation
    """
    Docstring for search
    
    :param query: Description
    :type query: str
    :return: Description
    :rtype: str
    """
    print(f"Searching for: {query}")
    return "Tokio weather is sunny with a high of 25°C."

# Create the agent with the search tool
model = ChatOpenAI(
    model="gpt-5",
    temperature=0.1,
    max_tokens=1000,
    timeout=30
    # ... (other params)
)
tools = [search]

# agent = create_agent("gpt-5", tools=tools)
agent = create_agent(model, tools=tools)

def main():
    print("Hello from react-search-agent!")
#     result = agent.invoke(
#     {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]}
# )
    result = agent.invoke(
    {"messages": [  HumanMessage("What's the weather in San Francisco?")]}
)
    print("Agent response:", result)

if __name__ == "__main__":
    main()
