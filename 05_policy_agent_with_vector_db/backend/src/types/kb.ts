export interface KBChunk {
  namespace: string; /// logical grouping of chunks
  source: string; // original source of the chunk (e.g., document name or URL)
  chunkId: number;
  text: string;
  embedding: number[]; // vector representation of the chunk
}
