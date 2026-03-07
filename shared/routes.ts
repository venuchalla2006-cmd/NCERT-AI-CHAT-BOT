import { z } from "zod";
import { insertDocumentSchema, insertChatMessageSchema, documents, chatMessages } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  documents: {
    list: {
      method: "GET" as const,
      path: "/api/documents" as const,
      responses: {
        200: z.array(z.custom<typeof documents.$inferSelect>()),
      },
    },
    upload: {
      method: "POST" as const,
      path: "/api/documents/upload" as const,
      // FormData is not typed in zod directly like this, but we define the response
      responses: {
        201: z.custom<typeof documents.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  chat: {
    list: {
      method: "GET" as const,
      path: "/api/chat" as const,
      input: z.object({
        className: z.string(),
        subject: z.string(),
      }),
      responses: {
        200: z.array(z.custom<typeof chatMessages.$inferSelect>()),
      },
    },
    message: {
      method: "POST" as const,
      path: "/api/chat" as const,
      input: insertChatMessageSchema,
      responses: {
        200: z.custom<typeof chatMessages.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    clear: {
      method: "DELETE" as const,
      path: "/api/chat/clear" as const,
      responses: {
        204: z.void(),
      }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type DocumentResponse = typeof documents.$inferSelect;
export type ChatMessageResponse = typeof chatMessages.$inferSelect;
