import {
  type Document,
  type InsertDocument,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";

export interface IStorage {
  getDocuments(className: string, subject: string): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;

  getChatMessages(className: string, subject: string): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(): Promise<void>;
}

export class DatabaseStorage implements IStorage {

  private documents: Document[] = [];
  private chatMessages: ChatMessage[] = [];

  async getDocuments(className: string, subject: string): Promise<Document[]> {
    return this.documents.filter(
      (doc) => doc.className === className && doc.subject === subject
    );
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const newDoc: Document = {
      id: Date.now(),
      ...doc,
      createdAt: new Date(),
    };

    this.documents.push(newDoc);
    return newDoc;
  }

  async getChatMessages(className: string, subject: string): Promise<ChatMessage[]> {
    return this.chatMessages
      .filter(
        (msg) => msg.className === className && msg.subject === subject
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt as any).getTime() -
          new Date(b.createdAt as any).getTime()
      );
  }

  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: Date.now(),
      ...msg,
      createdAt: new Date(),
    };

    this.chatMessages.push(newMessage);
    return newMessage;
  }

  async clearChatMessages(): Promise<void> {
    this.chatMessages = [];
  }
}

export const storage = new DatabaseStorage();