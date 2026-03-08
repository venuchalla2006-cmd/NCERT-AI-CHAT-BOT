import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
// @ts-ignore
import pdfParse from "pdf-parse";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Fetch documents
  app.get(api.documents.list.path, async (req, res) => {
    try {
      const documents = await storage.getDocuments(
        (req.query.className as string) || "",
        (req.query.subject as string) || ""
      );
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Upload document
  app.post(
    api.documents.upload.path,
    upload.single("file"),
    async (req, res) => {
      try {
        const { className, subject } = req.body;
        const file = req.file;

        if (!file || !className || !subject) {
          return res
            .status(400)
            .json({ message: "Missing file, className, or subject" });
        }

      const pdfData = await (pdfParse as any)(file.buffer);
const textContent = pdfData.text;

        const document = await storage.createDocument({
          filename: file.originalname,
          className,
          subject,
          content: textContent,
        });

        res.status(201).json(document);
      } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Failed to process PDF" });
      }
    }
  );

  // Chat listing
  app.get(api.chat.list.path, async (req, res) => {
    try {
      const { className, subject } = req.query;

      if (!className || !subject) {
        return res
          .status(400)
          .json({ message: "Missing className or subject" });
      }

      const messages = await storage.getChatMessages(
        className as string,
        subject as string
      );

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Clear chat
  app.delete(api.chat.clear.path, async (req, res) => {
    try {
      await storage.clearChatMessages();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear chat" });
    }
  });

  // Chat message (AI Tutor)
  app.post(api.chat.message.path, async (req, res) => {
    try {
      const input = api.chat.message.input.parse(req.body);

      // Save user message
      await storage.createChatMessage(input);

      // Get documents for RAG
      const documents = await storage.getDocuments(
        input.className,
        input.subject
      );

      const questionKeywords = input.content
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);

      let contextStr = "";

      for (const doc of documents) {
        const chunks = doc.content.split(/\n\s*\n/);

        const relevantChunks = chunks
          .map((chunk) => ({
            chunk,
            score: questionKeywords.filter((kw) =>
              chunk.toLowerCase().includes(kw)
            ).length,
          }))
          .filter((c) => c.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((c) => c.chunk);

        if (relevantChunks.length > 0) {
          contextStr += `\n--- Context from ${doc.filename} ---\n${relevantChunks.join(
            "\n...\n"
          )}`;
        }
      }

     const systemPrompt = `
You are the NCERT Doubt Solver AI tutor for school students.

Rules for answering:
1. Reply in the SAME language as the student's question.
2. If the question is Hindi → answer in Hindi/Hinglish.
3. If the question is Tamil → answer in Tamil/Tanglish.
4. If the question is English → answer in simple English.
5. Use simple student-friendly language.
6. Explain concepts clearly with examples.
7. Base explanations on NCERT syllabus.

Available NCERT Context:
${contextStr || "Answer using general NCERT knowledge."}
`;

      const response = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "llama3",
    prompt: `${systemPrompt}\n\nQuestion: ${input.content}`,
    stream: false
  })
});

const data = await response.json();

const responseContent =
  data.response || "Sorry, I could not understand the question.";

      const assistantMessage = await storage.createChatMessage({
        className: input.className,
        subject: input.subject,
        role: "assistant",
        content: responseContent,
      });

      res.status(200).json(assistantMessage);
    } catch (error) {
      console.error("Chat error:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          field: error.errors[0].path.join("."),
        });
      }

      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  return httpServer;
}
