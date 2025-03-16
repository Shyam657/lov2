import { useState, useRef, useEffect } from 'react';
import { Send, PaperclipIcon } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/lib/types';
import MessageList from './MessageList';
import FileUpload from './FileUpload';
import { cn } from '@/lib/utils';
import { processDocuments, generateResponse } from '@/api/chat';

interface ChatInterfaceProps {
  showUploadPanel?: boolean;
  onToggleUpload?: () => void;
}

const ChatInterface = ({ 
  showUploadPanel = false,
  onToggleUpload 
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current && !showUploadPanel) {
      inputRef.current.focus();
    }
  }, [showUploadPanel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      toast.success(`${files.length} document(s) ready for processing.`);
    }
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one document first.');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Call the API to process the documents
      const success = await processDocuments(uploadedFiles);
      
      if (success) {
        // Add a system message about successful document processing
        const newMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `I've processed ${uploadedFiles.length} document(s) and they're ready for querying. You can now ask me questions about their content.`,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newMessage]);
        toast.success('Documents processed successfully!');
        
        if (onToggleUpload) {
          onToggleUpload();
        }
        
        return true;
      } else {
        toast.error('Error processing documents. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing documents. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput && !showUploadPanel) return;
    
    if (showUploadPanel) {
      const success = await processFiles();
      if (!success) return;
    } else {
      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: trimmedInput,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      
      try {
        // Call the API to generate a response
        const botMessage = await generateResponse(trimmedInput, messages);
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Error getting response. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className={cn(
        "flex-1 flex",
        showUploadPanel ? "flex-col" : "flex-col-reverse"
      )}>
        {showUploadPanel ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Upload Documents</h2>
            <FileUpload onUploadComplete={handleFileUpload} />
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="glass-card rounded-xl overflow-hidden shadow-lg">
          <div className="flex items-start">
            <textarea
              ref={inputRef}
              placeholder={showUploadPanel ? "Ready to process your documents..." : "Type your message..."}
              value={showUploadPanel ? "" : input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading || showUploadPanel}
              className="flex-1 bg-transparent border-0 outline-none resize-none p-4 h-[56px] max-h-[200px] scrollbar-thin"
              rows={1}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={(!input.trim() && !showUploadPanel) || isLoading}
              className={cn(
                "p-4 text-white rounded-r-xl transition-all",
                isLoading 
                  ? "bg-primary/50 cursor-not-allowed" 
                  : "bg-primary hover:bg-primary/90 active:bg-primary/80"
              )}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2 px-2">
          <button 
            onClick={onToggleUpload}
            className="text-sm text-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <PaperclipIcon size={14} />
            {showUploadPanel ? "Back to chat" : "Upload documents"}
          </button>
          
          <p className="text-xs text-foreground/50">
            LangChain RAG Chatbot
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
