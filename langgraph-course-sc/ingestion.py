from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings


# Load environment variables (e.g., OPENAI_API_KEY) from the .env file
load_dotenv()

# Source URLs to scrape and index
urls = [
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
    "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/"
]

# Fetch the web content for each URL; each loader returns a list of Documents
docs = [WebBaseLoader(url).load() for url in urls]
# Flatten the list of lists into a single list of Documents
docs_list = [item for sublist in docs for item in sublist]

# Configure a text splitter that uses tiktoken to count tokens accurately.
# chunk_size=250 keeps each chunk small; chunk_overlap=0 means no repeated tokens between chunks.
text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=250, chunk_overlap=0
)

# Split every document into smaller chunks suitable for embedding and retrieval
doc_splits = text_splitter.split_documents(docs_list)

# Embed the chunks with OpenAI embeddings and persist them in a local Chroma vector store
vectorstore = Chroma.from_documents(
    documents=doc_splits,
    collection_name="rag-chroma",
    embedding=OpenAIEmbeddings(),
    persist_directory="./chroma"
)

# Open the persisted Chroma collection and expose it as a LangChain retriever
# so it can be queried with similarity search during RAG
retriever = Chroma(
    collection_name="rag-chroma",
    persist_directory="./.chroma",
    embedding_function=OpenAIEmbeddings(),
).as_retriever()