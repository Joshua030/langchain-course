# Tavily crawl is graph-based web crawler
import asyncio
import os
import ssl
from typing import Any, Dict, List

# help to verify SSL certificates
import certifi
from dotenv import load_dotenv
# help to create vector stores
from langchain_chroma import Chroma

# help to split text into smaller chunks
from langchain_classic.text_splitter import RecursiveCharacterTextSplitter

# help to create embeddings and vector stores
from langchain_core.documents import Document

# help to create embeddings and vector stores
from langchain_openai import OpenAIEmbeddings

# help to create embeddings and vector stores
from langchain_pinecone import PineconeVectorStore

# help to create embeddings and vector stores
from langchain_tavily import TavilyCrawl, TavilyExtract, TavilyMap

from logger import (Colors, log_error, log_header, log_info, log_success,
                    log_warning)

load_dotenv()

# Configure SSL context to use certifi certificates
ssl_context = ssl.create_default_context(cafile=certifi.where())
os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

# Initialize OpenAI Embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small", show_progress_bar=False, chunk_size=50, retry_min_seconds=10
)

#chroma= Chroma(persist_directory="chroma_db", embedding_function=embeddings)
# Initialize Pinecone Vector Store
vectorstore = PineconeVectorStore(index_name="langchain-docs-2025", embedding_function=embeddings)
taviliy_extract = TavilyExtract()
# Initialize Tavily Map and Crawl with custom parameters 
taviliy_map = TavilyMap(max_depth=5, max_breadth=20, max_pages=1000)
taviliy_crawl = TavilyCrawl()