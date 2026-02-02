import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";

// step 1 -> loading - raw file -> Document[]

//RAG pipeline mental model ->
// 1. Read pdf/md/txt files -> Document[]
// 2. Split Document[] into chunks -> Document[]
// 3. Generate embeddings for each chunk -> VectorDB
// 4. Store ->  save vectors + metadata (namespace, source, chunkId, text) -> VectorDB (MOngoDB/ Pinecone/ Weaviate)
// 5. User query -> generate embedding -> VectorDB similarity search -> retrieve top-k chunks
// 6. Use retrieved chunks as context to answer user query -> LLM

type SupportedMime = "application/pdf" | "text/markdown" | "text/plain";

export interface LoadFileArgs {
  filePath: string;
  mimeType: string;
  originalName: string;
}

function getExt(filename: string): string {
  const index = filename.lastIndexOf(".");

  return index === -1 ? "" : filename.slice(index + 1).toLowerCase();
}

export async function loadFileAsDocuments(
  args: LoadFileArgs,
): Promise<Document[]> {
  const { filePath, mimeType, originalName } = args;

  // extract file extension
  const extractExt = getExt(originalName);

  // determine file type
  const isMarkdown =
    mimeType === "text/markdown" ||
    extractExt === "md" ||
    extractExt === "mdx" ||
    extractExt === "markdown";
  const isPDF = mimeType === "application/pdf" || extractExt === "pdf";
  const isTxt =
    mimeType === "text/plain" || extractExt === "txt" || extractExt === "text";

  if (isPDF) {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    return docs.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        source: originalName,
      },
    }));
  }

  if (isMarkdown || isTxt) {
    const loader = new TextLoader(filePath);
    const docs = await loader.load();

    return docs.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        source: originalName,
      },
    }));
  }

  return [];
}
