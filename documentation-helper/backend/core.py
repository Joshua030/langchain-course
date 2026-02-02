import os
from typing import Any, Dict
from dotenv import load_dotenv
from langchain.agents import create_agent 
from langchain.chat_models import init_chat_model
from langchain.messages import ToolMessage
from langchain.tools import tool
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings

load_dotenv()

# Initialize embeddings (same as in ingestion.py)
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small"
)

# Initialize vector store
vectorstore = PineconeVectorStore(
    index_name=os.getenv("INDEX_NAME", "default-index"),
    embedding=embeddings
)

# Initialize chat model
model = init_chat_model("gpt-5.2", model_provider="openai")
 
    
@tool(response_format="content_and_artifact")
def retrieve_context(query: str) -> Dict[str, Any]:
    """Retrieve relevant documents from the vector store based on the query."""
    # Retrieve top 4 most similar documents
    retrieved_docs = vectorstore.as_retriever().invoke(query, k=4)

    # Serialize documents for the model
    serialized = "\n\n".join(
        (f"Source: {doc.metadata.get('source', 'unknown')}\n\nContent: {doc.page_content}" for doc in retrieved_docs)
    )

    # Return both serialized content and raw documents
    return serialized, retrieved_docs


def run_llm(query: str) -> Dict[str, Any]:
    """
    Run the RAG pipeline to answer a query using retrieved documentation.

    Args:
        query (str): The user query.

    Returns:
        Dictionary containing:
            - answer: The generated answer from the LLM.
            - context: List of retrieved documents
    """

    # Create the agent with the retrieve_context tool
    system_prompt = (
        "You are a helpful AI assistant that answers questions about LangChain documentation. "
        "You have access to a tool that retrieves relevant documentation. "
        "Use the tool to find relevant information before answering the user's question. "
        "Always cite the sources you use in your answers. "
        "If you don't know the answer, just say you don't know. "
    )

    agent = create_agent(
        model=model,
        tools=[retrieve_context],
        system_prompt=system_prompt
    )

    # Build messages list
    messages = [{"role": "user", "content": query}]

    # Invoke the agent
    response = agent.invoke({"messages": messages})

    # Extract the answer from the last AI message - use .content not ["content"]
    answer = response["messages"][-1].content

    # Extract the retrieved context from the tool message
    context_docs = []
    for message in response["messages"]:
        # Check if this is a ToolMessage with artifact
        if isinstance(message, ToolMessage) and hasattr(message, "artifact"):
            # The artifact should contain the list of Document objects
            if isinstance(message.artifact, list):
                context_docs.extend(message.artifact)

    return {
        "answer": answer,
        "context": context_docs
    }

if __name__ == "__main__":
    # Example usage
    result = run_llm(query="What is LangChain?")
    print("Answer:", result["answer"])
