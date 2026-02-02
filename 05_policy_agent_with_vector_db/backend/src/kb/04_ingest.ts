import { Document } from "@langchain/core/documents";
import { getVectorStore } from "./03_vectorStore";

export interface IngestSummary {
  ok: boolean;
  namespace: string;
  sources: string[];
  totalChunks: number;
}

// {
//     text: PageContent,
//     embedding: [...] // auto-generated embedding vector
//     namespace: default
//     source: FakeStreamingChatModel.pdf
//     chukId: 0 | 1
// }

export async function ingestDocuments(
  namespace: string,
  chunks: Document[],
): Promise<IngestSummary> {
  if (!namespace) {
    throw new Error("Namespace is required for ingestion.");
  }

  if (chunks.length === 0) {
    return {
      ok: false,
      namespace,
      sources: [],
      totalChunks: 0,
    };
  }

  // get vector store
  const vectorStore = await getVectorStore();

  // stable metadata for every document

  let currentId = 0;

  const docsWithMetadata = chunks.map((chunk) => {
    const source = (chunk?.metadata.source as string) || "unknown_source";

    const doc = new Document({
      pageContent: chunk.pageContent,
      metadata: {
        namespace,
        source,
        chunkId: currentId++,
      },
    });

    return doc;
  });

  await vectorStore.addDocuments(docsWithMetadata);

  const uniqueSources = Array.from(
    new Set(
      docsWithMetadata.map(
        (doc) => (doc.metadata.source as string) || "unknown_source",
      ),
    ),
  );

  return {
    ok: true,
    namespace,
    sources: uniqueSources,
    totalChunks: docsWithMetadata.length,
  };
}
