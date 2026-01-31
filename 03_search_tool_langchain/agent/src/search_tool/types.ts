// direct path -> LLM no browsing

export type Candidate = {
  answer: string;
  sources: string[];
  mode: "web" | "direct";
};
