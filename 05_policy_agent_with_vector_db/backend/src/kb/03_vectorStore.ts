// connects -> mongo atlas collection
// MongoDBAtlasVectorSearch
// kb (knowledge base) vector store
import { Collection as MongoCollection } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { getDatabase } from "../utils/mongo";
import { embeddings } from "../utils/openai";

const KB_COLLECTION_NAME = "kb_chunks";
const KB_INDEX_NAME = "kb_vector_index";

let collectionPromise: Promise<MongoCollection> | null = null;
let vectorStorePromise: Promise<MongoDBAtlasVectorSearch> | null = null;

export async function getKBCollection(): Promise<MongoCollection> {
  if (!collectionPromise) {
    collectionPromise = (async () => {
      const db = await getDatabase();
      const collection = db.collection(KB_COLLECTION_NAME);
      return collection;
    })();
  }

  return collectionPromise;
}

export async function getVectorStore(): Promise<MongoDBAtlasVectorSearch> {
  if (!vectorStorePromise) {
    vectorStorePromise = (async () => {
      const collection = await getKBCollection();

      const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection: collection as any,
        indexName: KB_INDEX_NAME,
        textKey: "text",
        embeddingKey: "embedding",
      });

      return vectorStore;
    })();
  }

  return vectorStorePromise;
}
