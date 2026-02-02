import { Router } from "express";
import z from "zod";
import { resumeAgentRun, startAgentRun } from "../graph/graph";

const router = Router();

const StartSchema = z.object({
  input: z.string().min(5, "Input is required"),
});

const ApproveSchema = z.object({
  threadId: z.string().min(5, "Thread ID is required"),
  approve: z.boolean(),
});

router.post("/", async (req, res) => {
  const parseResult = StartSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: "Error while parsing input" });
  }

  try {
    const result = await startAgentRun(parseResult.data.input);

    if ("final" in result) {
      return res.json({
        status: "ok",
        data: {
          final: result.final,
          kind: "final",
        },
      });
    }

    if ("interrupt" in result) {
      return res.json({
        status: "ok",
        data: {
          kind: "needs_approval",
          interrupt: {
            threadId: result.interrupt.threadId,
            steps: result.interrupt.steps,
            prompt: "Do you approve the above steps?",
          },
        },
      });
    }

    return res.status(500).json({ error: "Unexpected result from agent" });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected result from agent" });
  }
});

router.post("/approve", async (req, res) => {
  const parseResult = ApproveSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Error while parsing input" });
  }
  try {
    const { threadId, approve } = parseResult.data;
    const finalState = await resumeAgentRun({ threadId, approved: approve });
    return res.json({
      status: "ok",
      data: {
        kind: "final",
        final: finalState,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected result from agent" });
  }
});

export default router;
