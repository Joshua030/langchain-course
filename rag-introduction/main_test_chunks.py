import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore





def main():
    print("Hello from rag-introduction!")


if __name__ == "__main__":
    load_dotenv()
    print("Ingesting...")
    loader = TextLoader("mediumblog.txt")
    document = loader.load()
    print(f"Splitting...")
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    texts = text_splitter.split_documents(document)
    print(f"created {len(texts)} chunks")
    embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
    print(f"Connecting to Pinecone...")
    PineconeVectorStore.from_documents(
        texts,
        embeddings,
        index_name=os.getenv("INDEX_NAME"),
    )
    main()
