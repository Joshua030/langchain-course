// question -> [Retriever] => retrieve relevant

import { Document } from "@langchain/core/documents";
import { getVectorStore } from "./03_vectorStore";

export interface RetrieverResult {
  docs: Document[];
  confidence: number;
}

export async function retrieveRelevantChunks(
  query: string,
  namespace: string = "default",
  k: number = 2,
): Promise<RetrieverResult> {
  if (!query.trim()) {
    return {
      docs: [],
      confidence: 0,
    };
  }

  const vectorStore = await getVectorStore();

  // embeds 'query' -> vector
  // runs atlas vector search on our chunks vector store
  // find the similar chunks and return them

  const docs = await vectorStore.similaritySearchWithScore(query, k, {
    namespace,
  });

  if (!docs?.length) {
    return {
      docs: [],
      confidence: 0,
    };
  }

  const results: Document[] = docs.map(([doc]) => doc);

  // simple confidence score -> average of similarity scores
  const scores = docs.map(([, score]) => score);
  // lower score is better
  const best = Math.max(...scores);
  // normalize to 0-1
  const normalized = Math.max(0, Math.min(1, 1 - best)); // assuming score is distance, lower is better
  // convert to percentage
  const confidence = Number(normalized.toFixed(2));

  return {
    docs: results,
    confidence,
  };
}
