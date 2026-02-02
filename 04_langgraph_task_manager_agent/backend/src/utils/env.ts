import { configDotenv } from "dotenv";
import z from "zod";

configDotenv();

const EnvSchema = z.object({
  PORT: z.string().default("5000"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPEN_API_MODEL: z.string().default("gpt-4o-mini"),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

const raw = parsedEnv.data;

export const env = Object.freeze({
  PORT: Number(raw.PORT),
  OPENAI_API_KEY: raw.OPENAI_API_KEY,
  OPEN_API_MODEL: raw.OPEN_API_MODEL,
});
