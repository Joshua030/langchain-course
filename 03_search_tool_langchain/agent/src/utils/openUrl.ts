// fetch each web search result from Tavily API

import { convert } from "html-to-text";
import { OpenUrlOutputSchema } from "./schemas";

export async function openUrl(url: string) {
  // Step 1: Validate the URL
  const normalizedUrl = validateUrl(url);

  // Step 2: Fetch the URL, avoiding bot detection

  const res = await fetch(normalizedUrl, {
    headers: {
      "User-Agent": "agent-core/1.0 (+course-demo)",
    },
  });

  if (!res.ok) {
    const text = await safeText(res);
    throw new Error(
      `Failed to fetch URL ${normalizedUrl} - ${res.status} - ${text}`,
    );
  }

  // Step 3: Handle the response based on content type
  const contentType = res.headers.get("content-type") || "";

  // Step 4: Convert HTML to text if necessary
  const rawContent = await res.text();
  const text = contentType.includes("text/html")
    ? convert(rawContent, {
        wordwrap: false,
        selectors: [
          {
            selector: "nav",
            format: "skip",
          },
          {
            selector: "footer",
            format: "skip",
          },
          {
            selector: "header",
            format: "skip",
          },
          {
            selector: "script",
            format: "skip",
          },
          { selector: "style", format: "skip" },
        ],
      })
    : rawContent;

  // Step 5: Clean and cap the text content
  const cleaned = collapseWhitespace(text);
  const capped = cleaned.slice(0, 8000);

  return OpenUrlOutputSchema.parse({
    url: normalizedUrl,
    content: capped,
  });
}

function validateUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    // Basic validation to ensure the URL has a valid protocol
    if (!/^https?:\/\//i.test(parsedUrl.protocol)) {
      throw new Error(`Invalid URL protocol: ${parsedUrl.protocol}`);
    }

    // Additional validations can be added here if necessary
    return parsedUrl.toString();
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.json();
  } catch {
    return "<unable to read response body>";
  }
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
