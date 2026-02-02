// chunking -> bridge between raw docs and useful rag
// keeping chunks very big -> retriever
// keeping chunks small -> more precise answers from LLM
// small but at the same time large enough to provide context

import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const CHUNK_SIZE = 1000; // characters
const CHUNK_OVERLAP = 200; // characters

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE,
  chunkOverlap: CHUNK_OVERLAP,
});

export async function splitDocuments(docs: Document[]): Promise<Document[]> {
  if (docs.length === 0) return [];

  const chunkedDocs = await splitter.splitDocuments(docs);

  return chunkedDocs.map((chunk, index) => {
    const base = chunk?.metadata || {};

    return new Document({
      pageContent: chunk.pageContent.trim(),
      metadata: {
        ...base,
        source: base.source || "unknown_source",
        _chunkIndex: index,
      },
    });
  });
}
