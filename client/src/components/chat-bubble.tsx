import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
        isUser 
          ? "bg-gradient-to-tr from-slate-700 to-slate-600 border border-white/10" 
          : "bg-gradient-to-tr from-primary to-accent shadow-primary/20"
      }`}>
        {isUser ? <User className="w-5 h-5 text-white/80" /> : <Sparkles className="w-5 h-5 text-white" />}
      </div>

      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${
        isUser 
          ? "glass-card rounded-tr-sm" 
          : "bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 rounded-tl-sm backdrop-blur-md"
      }`}>
        {isUser ? (
          <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none text-white/90">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
