import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, BookOpen, MessageSquareText, UploadCloud } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 overflow-hidden pt-20 pb-32">
        {/* Background decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-primary-foreground mb-8"
          >
            <SparklesIcon className="w-4 h-4 text-accent" />
            <span>AI-Powered Hinglish & Tanglish Tutor</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-display font-extrabold tracking-tight mb-6"
          >
            Master NCERT Concepts in <br className="hidden sm:block" />
            <span className="text-gradient">Your Own Language</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Struggling with complex textbook English? Our AI tutor explains NCERT topics naturally using Hinglish and Tanglish, perfectly tailored to your class and subject.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/ask" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/upload" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold glass-card text-white hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-5 h-5" />
              Upload Textbooks
            </Link>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-32 w-full">
          <FeatureCard 
            icon={<BookOpen className="w-6 h-6 text-primary" />}
            title="Class-Specific"
            description="Select your standard from 6th to 12th and get answers tailored to your curriculum level."
            delay={0.4}
          />
          <FeatureCard 
            icon={<MessageSquareText className="w-6 h-6 text-accent" />}
            title="Hinglish/Tanglish"
            description="Explanations that sound like a friend helping you study. 'Bhai, friction essentially yeh hota hai ki...'"
            delay={0.5}
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-6 h-6 text-pink-400" />}
            title="RAG Powered"
            description="Answers are grounded directly in the uploaded NCERT PDFs, ensuring 100% textbook accuracy."
            delay={0.6}
          />
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 rounded-2xl flex flex-col items-start text-left hover:border-primary/30 transition-colors"
    >
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
