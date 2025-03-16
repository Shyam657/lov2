
import { Bot, FileText, Search, Zap, Layers, Lock } from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: 'Contextual Understanding',
      description: 'Our AI understands the context of your questions based on your uploaded documents.',
      icon: Bot,
    },
    {
      title: 'Multiple File Formats',
      description: 'Upload documents in PDF, DOCX, and TXT formats for seamless analysis.',
      icon: FileText,
    },
    {
      title: 'Semantic Search',
      description: 'Advanced retrieval system that understands the meaning behind your questions.',
      icon: Search,
    },
    {
      title: 'Lightning Fast',
      description: 'Get instant answers to your queries with our optimized RAG system.',
      icon: Zap,
    },
    {
      title: 'Knowledge Base',
      description: 'Build your own knowledge base by uploading domain-specific documents.',
      icon: Layers,
    },
    {
      title: 'Secure Processing',
      description: 'Your documents are processed securely and not shared with third parties.',
      icon: Lock,
    },
  ];

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-4 animate-fade-in">Powerful RAG Features</h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto animate-fade-in">
            Our platform combines the power of Retrieval Augmented Generation with intuitive design to provide the best document Q&A experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <feature.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
