import { db } from "./db";
import {
  documents,
  chatMessages,
  type Document,
  type InsertDocument,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getDocuments(className: string, subject: string): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  
  getChatMessages(className: string, subject: string): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getDocuments(className: string, subject: string): Promise<Document[]> {
    return await db.select().from(documents).where(
      and(
        eq(documents.className, className),
        eq(documents.subject, subject)
      )
    );
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(doc).returning();
    return document;
  }

  async getChatMessages(className: string, subject: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(
      and(
        eq(chatMessages.className, className),
        eq(chatMessages.subject, subject)
      )
    ).orderBy(chatMessages.createdAt);
  }

  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(msg).returning();
    return message;
  }

  async clearChatMessages(): Promise<void> {
    await db.delete(chatMessages);
  }
}

export const storage = new DatabaseStorage();
