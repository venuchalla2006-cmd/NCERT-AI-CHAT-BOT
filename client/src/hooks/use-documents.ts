import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDocuments() {
  return useQuery({
    queryKey: [api.documents.list.path],
    queryFn: async () => {
      const res = await fetch(api.documents.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      return api.documents.list.responses[200].parse(data);
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, className, subject }: { file: File; className: string; subject: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("className", className);
      formData.append("subject", subject);

      const res = await fetch(api.documents.upload.path, {
        method: api.documents.upload.method,
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to upload document");
      const data = await res.json();
      return api.documents.upload.responses[201].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
    },
  });
}
