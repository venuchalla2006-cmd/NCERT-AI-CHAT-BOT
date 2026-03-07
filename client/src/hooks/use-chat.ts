import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useChatHistory(className: string, subject: string) {
  return useQuery({
    queryKey: ["chat", className, subject],
    queryFn: async () => {
      const url = new URL(api.chat.list.path, window.location.origin);
      url.searchParams.append("className", className);
      url.searchParams.append("subject", subject);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chat history");
      const data = await res.json();
      return api.chat.list.responses[200].parse(data);
    },
    enabled: Boolean(className && subject),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: { className: string; subject: string; role: "user" | "assistant"; content: string }) => {
      const validated = api.chat.message.input.parse(message);
      
      const res = await fetch(api.chat.message.path, {
        method: api.chat.message.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      return api.chat.message.responses[200].parse(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat", variables.className, variables.subject] });
    },
  });
}

export function useClearChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.chat.clear.path, {
        method: api.chat.clear.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to clear chat");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}
