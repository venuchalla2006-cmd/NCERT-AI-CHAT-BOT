import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, UploadCloud } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30">
      <header className="sticky top-0 z-50 glass-card border-b border-white/5 rounded-none px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-wide text-white">
              NCERT <span className="text-gradient">Solver</span>
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/ask" 
              className={`text-sm font-medium transition-colors hover:text-white ${location === "/ask" ? "text-white" : "text-muted-foreground"}`}
            >
              Ask Tutor
            </Link>
            <Link 
              href="/upload" 
              className={`text-sm font-medium transition-colors hover:text-white ${location === "/upload" ? "text-white" : "text-muted-foreground"}`}
            >
              Upload PDF
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex flex-col w-full h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
