// Legal contract backend --> AI models --> frontend

import z from "zod";

export const WebSearchResultSchema = z.object({
  title: z.string().describe("The title of the web search result"),
  snippet: z
    .string()
    .optional()
    .describe("A brief snippet or summary of the web search result"),
  url: z.url().describe("The URL of the web search result"),
});

export const WebSearchResultsSchema = z.array(WebSearchResultSchema).max(10);

export type WebSearchResult = z.infer<typeof WebSearchResultSchema>;

export const OpenUrlInputSchema = z.object({
  url: z.url(),
});

export const OpenUrlOutputSchema = z.object({
  url: z.url(),
  content: z.string().min(1),
});

export const summarizeInputSchema = z.object({
  text: z.string().min(50, "Text must be at least 50 characters long"),
});

export const summarizeOutputSchema = z.object({
  summary: z.string().min(1),
});

export const SearchInputSchema = z.object({
  q: z.string().min(5, "Query must be at least 5 characters long"),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;

export const SearchAnswerSchema = z.object({
  answer: z.string().min(1),
  sources: z.array(z.url()).default([]),
});

export type SearchAnswer = z.infer<typeof SearchAnswerSchema>;
