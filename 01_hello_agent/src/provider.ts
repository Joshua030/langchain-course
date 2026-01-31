export type Provider = "openai" | "gemini" | "groq";

type HelloOutput = {
  ok: boolean;
  provider: Provider;
  model: string;
  message: string;
};

/******************************************** 
 * 
Gemini Integration 

*********************************************/

type GeminiGenerateContent = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

async function helloGemini(): Promise<HelloOutput> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Model api key is not defined in environment variables");
  }
  const model = "gemini-3-flash-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello, world!",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data: GeminiGenerateContent = await response.json();
    return {
      ok: true,
      provider: "gemini",
      model,
      message:
        data.candidates?.[0].content?.parts?.[0].text || "No content generated",
    };
  } catch (error: Error | unknown) {
    console.log(error, "error");
    return {
      ok: false,
      provider: "gemini",
      model,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/******************************************** 
 * 
Chat Gpt Integration 

*********************************************/

type OpenAIGenerateResponse = {
  choices?: { message?: { content?: string } }[];
};

async function helloOpenAI(): Promise<HelloOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Model api key is not defined in environment variables");
  }
  const model = "gpt-3.5-turbo";
  const url = "https://api.openai.com/v1/chat/completions";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Hello, world!" }],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data: OpenAIGenerateResponse = await response.json();
    return {
      ok: true,
      provider: "openai",
      model,
      message: data.choices?.[0].message?.content || "No content generated",
    };
  } catch (error: Error | unknown) {
    return {
      ok: false,
      provider: "openai",
      model,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/******************************************** 
 * 
Groq Integration 

*********************************************/

async function helloGroq(): Promise<HelloOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Model api key is not defined in environment variables");
  }
  const model = "llama-3.3-70b-versatile";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Hello, world!" }],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data: OpenAIGenerateResponse = await response.json();
    return {
      ok: true,
      provider: "groq",
      model,
      message: data.choices?.[0].message?.content || "No content generated",
    };
  } catch (error: Error | unknown) {
    return {
      ok: false,
      provider: "groq",
      model,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/******************************************** 
 * 
Select Provider

*********************************************/

export async function selectAndHello(): Promise<HelloOutput> {
  const provider = process.env.PROVIDER as Provider;

  switch (provider) {
    case "openai":
      return await helloOpenAI();
    case "gemini":
      return await helloGemini();
    case "groq":
      return await helloGroq();
    default:
      throw new Error(
        `Unsupported provider: ${provider}. Supported providers are openai, gemini, groq.`,
      );
  }
}
