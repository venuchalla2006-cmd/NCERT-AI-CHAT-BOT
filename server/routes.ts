import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import * as pdfParse from "pdf-parse";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Fetch documents
  app.get(api.documents.list.path, async (req, res) => {
    try {
      const documents = await storage.getDocuments(
        req.query.className as string || "",
        req.query.subject as string || ""
      );
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Upload document
  app.post(api.documents.upload.path, upload.single("file"), async (req, res) => {
    try {
      const { className, subject } = req.body;
      const file = req.file;

      if (!file || !className || !subject) {
        return res.status(400).json({ message: "Missing file, className, or subject" });
      }

      // Parse PDF
      const pdfData = await pdfParse(file.buffer);
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
  });

  // Chat listing
  app.get(api.chat.list.path, async (req, res) => {
    try {
      const { className, subject } = req.query;
      if (!className || !subject) {
        return res.status(400).json({ message: "Missing className or subject" });
      }
      const messages = await storage.getChatMessages(className as string, subject as string);
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

  // Chat message (Hinglish/Tanglish AI Tutor)
  app.post(api.chat.message.path, async (req, res) => {
    try {
      const input = api.chat.message.input.parse(req.body);
      
      // Save user message
      const userMessage = await storage.createChatMessage(input);

      // Fetch relevant documents for context (RAG)
      const documents = await storage.getDocuments(input.className, input.subject);
      
      // Simple text matching for context (since embeddings aren't available in this blueprint)
      // We'll extract paragraphs containing keywords from the question
      const questionKeywords = input.content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      let contextStr = "";
      
      for (const doc of documents) {
        // Split content into chunks
        const chunks = doc.content.split(/\n\s*\n/);
        const relevantChunks = chunks
          .map(chunk => ({
            chunk,
            score: questionKeywords.filter(kw => chunk.toLowerCase().includes(kw)).length
          }))
          .filter(c => c.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5) // top 5 most relevant chunks
          .map(c => c.chunk);
          
        if (relevantChunks.length > 0) {
          contextStr += `\n--- Context from ${doc.filename} ---\n${relevantChunks.join("\n...\n")}`;
        }
      }

      // Construct LLM prompt
      const systemPrompt = `You are the NCERT Doubt Solver, an AI Tutor designed for students to ask questions from NCERT textbooks.
Respond with:
- A simple explanation based STRICTLY on the NCERT textbook content provided.
- Written in a friendly Hinglish (Hindi + English) or Tanglish (Tamil + English) language. Default to Hinglish if unsure.
- Highlight important concepts and provide examples if needed.
- Avoid complex language.

Available NCERT Context:
${contextStr ? contextStr : "No specific NCERT text available for this topic, but answer based on general NCERT syllabus knowledge."}
`;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.content }
        ],
      });

      const responseContent = aiResponse.choices[0].message.content || "Sorry, I could not understand the question.";

      // Save assistant message
      const assistantMessage = await storage.createChatMessage({
        className: input.className,
        subject: input.subject,
        role: "assistant",
        content: responseContent
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
