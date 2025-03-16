
import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/lib/types';
import { FileText, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

const MessageList = ({ messages, isLoading = false }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin pb-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Bot size={32} className="text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Start a conversation</h3>
          <p className="text-foreground/70 max-w-md">
            Ask questions about your uploaded documents or start with a general question.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={cn(
                "flex gap-4 px-4 py-6 rounded-xl animate-fade-in",
                message.role === 'user' ? 'bg-secondary/40' : 'glass-card'
              )}
              style={{ 
                animationDuration: '0.3s',
                animationDelay: messages.indexOf(message) * 0.05 + 's'
              }}
            >
              <div className="flex-shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  message.role === 'user' ? 'bg-foreground/10' : 'bg-primary/20'
                )}>
                  {message.role === 'user' ? (
                    <User size={16} className="text-foreground/80" />
                  ) : (
                    <Bot size={16} className="text-primary" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium">
                    {message.role === 'user' ? 'You' : 'LangRAG Assistant'}
                  </h4>
                  <span className="text-xs text-foreground/50">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className="prose prose-invert max-w-none text-foreground/90">
                  {message.content}
                </div>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-foreground/60 mb-2">Sources:</p>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-secondary/40 p-2 rounded text-sm">
                          <FileText size={14} className="flex-shrink-0 mt-0.5 text-foreground/70" />
                          <div className="flex-1 overflow-hidden">
                            <p className="font-medium truncate">{source.name}{source.page ? ` (Page ${source.page})` : ''}</p>
                            <p className="text-foreground/70 text-xs line-clamp-2">{source.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 px-4 py-6 glass-card rounded-xl animate-pulse">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot size={16} className="text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-2 bg-foreground/10 rounded w-24"></div>
                <div className="h-2 bg-foreground/10 rounded w-full"></div>
                <div className="h-2 bg-foreground/10 rounded w-4/5"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
