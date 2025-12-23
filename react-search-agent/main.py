from dotenv import load_dotenv
load_dotenv()

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langchain_tavily import TavilySearch
# from tavily import TavilyClient



# Manual search tool implementation
# tavily_client = TavilyClient()

# @tool
# def search(query: str) -> str:
#     """
#     Tool that searches over internet
#     Args:
#         query: The query to search for
#     Returns:
#         The search result
#     """
#     print(f"Searching for {query}")
#     return tavily_client.search(query=query)

# Create the agent with the search tool
model = ChatOpenAI(
    model="gpt-5",
    temperature=0.1,
    # max_tokens=1000, // set the ampit of tokens you want in response
    timeout=60
    # ... (other params)
)
tools = [TavilySearch()]

# agent = create_agent("gpt-5", tools=tools)
agent = create_agent(model, tools=tools)

def main():
    print("Hello from react-search-agent!")
#     result = agent.invoke(
#     {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]}
# )
    result = agent.invoke(
    {"messages": [  HumanMessage("search for 3 job postings for an aiengineer using langchain in the bay area on linkedin and list their details")]}
)
    print("Agent response:", result)

if __name__ == "__main__":
    main()
