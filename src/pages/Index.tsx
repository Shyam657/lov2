
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import { ArrowRight, Bot, Upload, Database } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex flex-col">
        <Hero />
        <Features />
        
        {/* How It Works Section */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-4">How It Works</h2>
              <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
                Our advanced RAG system makes it easy to extract insights from your documents in just a few simple steps.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="text-primary" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Upload Documents</h3>
                <p className="text-foreground/80">
                  Upload your PDF, DOCX, or TXT files through our intuitive interface.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Database className="text-primary" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. AI Processing</h3>
                <p className="text-foreground/80">
                  Our system analyzes and indexes your documents for quick retrieval.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="text-primary" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Ask Questions</h3>
                <p className="text-foreground/80">
                  Get accurate answers based on the content of your documents.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-12 border-t border-white/10">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-2">
                  <span className="text-gradient font-bold text-2xl">LangRAG</span>
                </div>
                <p className="text-foreground/60 mt-2 text-sm">
                  Powered by LangChain and Together AI
                </p>
              </div>
              
              <div className="flex gap-8">
                <Link to="/" className="text-foreground/60 hover:text-foreground transition-colors">Home</Link>
                <Link to="/chat" className="text-foreground/60 hover:text-foreground transition-colors">Chat</Link>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">GitHub</a>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-center text-foreground/40 text-sm">
              © {new Date().getFullYear()} LangRAG. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
