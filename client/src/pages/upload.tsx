import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Layout } from "@/components/layout";
import { useDocuments, useUploadDocument } from "@/hooks/use-documents";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function Upload() {
  const { data: documents = [], isLoading: docsLoading } = useDocuments();
  const uploadDoc = useUploadDocument();
  
  const [file, setFile] = useState<File | null>(null);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !className || !subject) return;

    try {
      await uploadDoc.mutateAsync({ file, className, subject });
      setUploadStatus("success");
      setFile(null);
      setClassName("");
      setSubject("");
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (err) {
      setUploadStatus("error");
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4 md:p-8">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Knowledge Base Management</h1>
          <p className="text-muted-foreground">Upload NCERT textbooks (PDFs) to feed the RAG pipeline.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 glass-card p-6 rounded-3xl h-fit"
          >
            <h2 className="text-xl font-bold text-white mb-6">Upload New PDF</h2>
            
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Class Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Class 10"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Subject</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Science"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">PDF Document</label>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive ? "border-primary bg-primary/10" : "border-white/20 bg-black/20 hover:border-white/40 hover:bg-black/40"
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 text-primary mb-3" />
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-white/50 mt-1">Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-10 h-10 text-white/40 mb-3" />
                      <p className="text-sm font-medium text-white/80">Drag & drop PDF here</p>
                      <p className="text-xs text-white/50 mt-1">or click to browse</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || !className || !subject || uploadDoc.isPending}
                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-accent text-white shadow-lg disabled:opacity-50 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2"
              >
                {uploadDoc.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                ) : (
                  "Process & Upload"
                )}
              </button>

              {uploadStatus === "success" && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" /> Uploaded successfully!
                </div>
              )}
              {uploadStatus === "error" && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" /> Failed to upload.
                </div>
              )}
            </form>
          </motion.div>

          {/* Document List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 glass-card p-6 rounded-3xl"
          >
            <h2 className="text-xl font-bold text-white mb-6">Indexed Documents</h2>
            
            {docsLoading ? (
              <div className="flex py-12 justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 border border-white/10 rounded-2xl bg-black/20">
                <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4 hover:bg-white/10 transition-colors">
                    <div className="p-3 bg-primary/20 rounded-lg">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white truncate" title={doc.filename}>{doc.filename}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">{doc.className}</span>
                        <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">{doc.subject}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-2">
                        {new Date(doc.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
