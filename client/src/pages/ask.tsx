import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout";
import { ChatBubble } from "@/components/chat-bubble";
import { useChatHistory, useSendMessage, useClearChat } from "@/hooks/use-chat";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Settings2, Trash2, Loader2 } from "lucide-react";

const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
const SUBJECTS = ["Science", "Mathematics", "Social Science", "Physics", "Chemistry", "Biology"];

export default function Ask() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isConfigured, setIsConfigured] = useState(false);

  const handleStart = () => {
    if (selectedClass && selectedSubject) setIsConfigured(true);
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-5xl mx-auto w-full h-full">
        <AnimatePresence mode="wait">
          {!isConfigured ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="glass-card p-8 md:p-12 rounded-3xl w-full max-w-2xl shadow-2xl"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                  <Settings2 className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Configure Your Tutor</h1>
                <p className="text-muted-foreground">Select your class and subject to get context-aware answers from NCERT textbooks.</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Select Class</label>
                  <div className="flex flex-wrap gap-3">
                    {CLASSES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedClass(c)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          selectedClass === c 
                            ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105" 
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Select Subject</label>
                  <div className="flex flex-wrap gap-3">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSubject(s)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          selectedSubject === s 
                            ? "bg-accent text-white shadow-lg shadow-accent/25 scale-105" 
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  disabled={!selectedClass || !selectedSubject}
                  className="w-full mt-4 py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-accent text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                  Start Session
                </button>
              </div>
            </motion.div>
          ) : (
            <ChatInterface 
              className={selectedClass} 
              subject={selectedSubject} 
              onReset={() => setIsConfigured(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function ChatInterface({ className, subject, onReset }: { className: string; subject: string; onReset: () => void }) {
  const { data: messages = [], isLoading } = useChatHistory(className, subject);
  const sendMessage = useSendMessage();
  const clearChat = useClearChat();
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    sendMessage.mutate({
      className,
      subject,
      role: "user",
      content: input.trim()
    }, {
      onSuccess: () => setInput("")
    });
  };

  return (
    <motion.div 
      key="chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col w-full h-[85vh] glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 backdrop-blur-xl shrink-0">
        <div>
          <h2 className="font-display font-bold text-lg text-white">NCERT AI Tutor</h2>
          <p className="text-xs text-primary font-medium tracking-wider uppercase">
            {className} • {subject}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => clearChat.mutate()}
            title="Clear Chat"
            className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            onClick={onReset}
            title="Change Subject"
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-white mb-2">Start your lesson!</p>
            <p className="text-sm text-white/70 max-w-sm">Ask any question from your NCERT book. Try asking in Hinglish or Tanglish!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatBubble key={msg.id || idx} role={msg.role as "user"|"assistant"} content={msg.content} />
          ))
        )}
        
        {sendMessage.isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 text-primary items-center p-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Tutor is typing...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/10 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here (e.g., 'What is photosynthesis?')..."
            className="w-full glass-input rounded-2xl pl-6 pr-14 py-4 text-white placeholder:text-white/40 focus:outline-none"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessage.isPending}
            className="absolute right-2 p-2 bg-gradient-to-r from-primary to-accent rounded-xl text-white shadow-lg disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
