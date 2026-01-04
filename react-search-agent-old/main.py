from dotenv import load_dotenv
from langchain_classic import hub
# pip install langchain-classic

from langchain_classic.agents import AgentExecutor
from langchain_classic.agents import create_react_agent
from langchain_openai import ChatOpenAI
from langchain_tavily import TavilySearch

load_dotenv()

tools =[TavilySearch()]
model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1,
    timeout=60
)
react_prompt = hub.pull("hwchase17/react")
agent = create_react_agent(llm=model, tools=tools, prompt=react_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
chain = agent_executor

def main():
   result = chain.invoke({
    "input": "search for 3 job postings for an AI engineer using LangChain in the Bay Area on LinkedIn and list their details"
})

   print(result)


if __name__ == "__main__":
    main()
