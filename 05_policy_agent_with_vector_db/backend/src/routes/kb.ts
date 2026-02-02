import { Router } from "express";
import multer from "multer";
import { loadFileAsDocuments } from "../kb/01_loaders";
import { splitDocuments } from "../kb/02_splitter";
import { ingestDocuments } from "../kb/04_ingest";

export const kbRouter = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});

kbRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const namespace = "default";

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
        ok: false,
      });
    }

    const { path, originalname, mimetype } = req.file;

    // load file as documents
    const documents = await loadFileAsDocuments({
      filePath: path,
      mimeType: mimetype,
      originalName: originalname,
    });

    if (!documents.length) {
      return res.status(400).json({
        message: "Unsupported file type or empty document",
        ok: false,
      });
    }

    // split documents into chunks
    const chunks = await splitDocuments(documents);

    if (chunks.length === 0) {
      return res.status(400).json({
        message: "No content to ingest after splitting",
        ok: false,
      });
    }

    // ingest chunks into vector store

    const summary = await ingestDocuments(namespace, chunks);

    return res.status(200).json({
      ok: true,
      namespace: summary.namespace,
      totalChunks: summary.totalChunks,
      sources: summary.sources,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while uploading the file",
      ok: false,
    });
  }
});
