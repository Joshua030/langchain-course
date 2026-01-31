import express from "express";
import cors from "cors";
import { askStructured } from "./ask-core";
import { loadEnv } from "./env";

loadEnv();
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  }),
);

app.use(express.json());

app.post("/ask", async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Invalid query parameter" });
  }

  try {
    const answer = await askStructured(query);
    res.json(answer);
  } catch (error) {
    console.error("Error processing /ask request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
