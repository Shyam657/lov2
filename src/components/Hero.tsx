
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center pt-20 pb-16">
      <div className="container-custom relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-20 animate-pulse-gentle" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl opacity-20 animate-pulse-gentle" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-ping-slow"></span>
            Powered by LangChain & Together AI
          </div>
          
          <h1 className="heading-xl mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient">Intelligent</span> document Q&A 
            <br />with RAG technology
          </h1>
          
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Upload your documents and instantly get accurate answers through our advanced RAG-powered chatbot. Perfect for research, analysis, and knowledge extraction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/chat" className="btn-primary flex items-center justify-center gap-2">
              Start chatting
              <ArrowRight size={18} />
            </Link>
            <Link to="/chat?upload=true" className="btn-secondary flex items-center justify-center">
              Upload documents
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
