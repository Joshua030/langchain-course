import os
from operator import itemgetter

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

load_dotenv()
print("Initializing chat model...")
embeddings = OpenAIEmbeddings()
llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo")

vectorstore = PineconeVectorStore(
    index_name=os.getenv("INDEX_NAME"),
    embedding=embeddings,
)

# Create a retriever from the vector store, retiever is used to fetch relevant documents
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})


prompt_template = ChatPromptTemplate.from_template(
    """Answer the question based only on the following context:
    {context}

    Question: {question}

    Provide a detailed answer:

    """
)

query = "What is pinecone in machine learning?"


def main():

    print("Hello from rag-introduction!")


def format_docs(docs):
    """Format retrieved documents into a string."""
    return "\n\n".join([doc.page_content for doc in docs])


def retrieval_chain_without_lcel(query: str):
    """
    Simple retrieval chain without LCEL.
    Manually retrieves documents, formats them, and generate a response.

    Limitations:
    - Manual step-by-step execution
    - No built-in streaming support
    - No async support without additional code
    - Harder to compose with other chains
    - More verbose and error-prone
    """

    # Step 1: Retrieve relevant documents
    docs = retriever.invoke(query)

    # step 2: Format documents into a context string
    context = format_docs(docs)

    # Step 3: Format the prompt with context and query
    messages = prompt_template.format_messages(context=context, question=query)

    # step 4: Invoke LLM with the formatted messages
    response = llm.invoke(messages)

    # 5. Return the response content
    return response.content


# ====================================================================
# Implemntation 2: With LCEL (LangChain Expression Language) - BETTER APPROACH
# ====================================================================
def create_retrieval_chain_with_lcel():
    """
    Create a retrieval chain using LCEL (LangChain Expression Language).
    Returns a chain that can be invoked with {""question": "..."}.

    Advantages over non-LCEL approach:
    - Declarative and composable: Easy to chain operations with pipe operator (|)
    - Built-in streaming: chain.stream() works out of the box
    - Built in async: chain.ainvoke() and chain.astream() available
    - Batch processing: chain.batch() for multiple inputs
    - Type safety: Better integration with LangChain's type system
    - Less code: More concise and readable
    - Reusable: Chain can be saved, shared, and composeed with other chains
    - Better debugging: LangChain provides better observability tools
    """

    # LCEL convert function in runnables
    # RunnablePassThrough: A no-op runnable that passes input through unchanged
    # Lambda functions can be used to wrap regular functions for use in LCEL chains

    retrieval_chain = (
        RunnablePassthrough.assign(
            context=itemgetter("question") | retriever | format_docs
        )
        | prompt_template
        | llm
        | StrOutputParser()
    )
    return retrieval_chain


if __name__ == "__main__":
    main()

    # ====================================================================
    # Option 0 : Rag invocation without rag
    # ====================================================================
    print("\n" + "=" * 70)  # Print a separator line
    print("Option 0: RAG invocation without RAG")
    print("\n" + "=" * 70)  # Print a separator line
    result_raw = llm.invoke([HumanMessage(content=query)])
    print("\nAnswer")
    print(result_raw.content)

    # ====================================================================
    # Option 1 : Use implementation without LCEL
    # ====================================================================
    print("\n" + "=" * 70)  # Print a separator line
    print("Option 1: Use implementation without LCEL")
    print("\n" + "=" * 70)  # Print a separator line
    result_without_lcel = retrieval_chain_without_lcel(query)
    print("\nAnswer")
    print(result_without_lcel)

    # ========================================================================
    # Option 2: Use implementation WITH LCEL (Better Approach)
    # ========================================================================
    print("\n" + "=" * 70)
    print("IMPLEMENTATION 2: With LCEL - Better Approach")
    print("=" * 70)
    print("Why LCEL is better:")
    print("- More concise and declarative")
    print("- Built-in streaming: chain.stream()")
    print("- Built-in async: chain.ainvoke()")
    print("- Easy to compose with other chains")
    print("- Better for production use")
    print("=" * 70)

    chain_with_lcel = create_retrieval_chain_with_lcel()
    result_with_lcel = chain_with_lcel.invoke({"question": query})
    print("\nAnswer:")
    print(result_with_lcel)
