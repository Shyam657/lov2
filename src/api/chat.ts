
import { Message, DocumentSource } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Backend API endpoint (update this with your deployed backend URL)
const API_URL = import.meta.env.VITE_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://your-aws-lambda-url.amazonaws.com/api' 
                  : 'http://localhost:5000/api');

// Process and index uploaded documents
export const processDocuments = async (files: File[]): Promise<boolean> => {
  try {
    // Create a FormData object to send files
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    
    // Send files to backend for processing
    const response = await fetch(`${API_URL}/process-documents`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process documents');
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error processing documents:', error);
    throw new Error('Failed to process documents');
  }
};

// Generate a response to a user query using LangChain
export const generateResponse = async (
  query: string, 
  chatHistory: Message[]
): Promise<Message> => {
  try {
    // Convert our frontend Message format to a simpler format for the API
    const historyForApi = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Send query to backend
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        history: historyForApi
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate response');
    }
    
    const result = await response.json();
    
    // Convert API response to our frontend Message format
    return {
      id: uuidv4(),
      role: 'assistant',
      content: result.response,
      timestamp: new Date(),
      sources: result.sources ? result.sources.map((source: any) => ({
        name: source.name,
        page: source.page,
        content: source.content
      })) : undefined
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
};
