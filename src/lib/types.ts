
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: DocumentSource[];
}

export interface DocumentSource {
  name: string;
  page?: number;
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
}
