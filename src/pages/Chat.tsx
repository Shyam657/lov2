
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);

  // Check URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const uploadParam = params.get('upload');
    setShowUpload(uploadParam === 'true');
  }, [location.search]);

  const toggleUploadPanel = () => {
    const newShowUpload = !showUpload;
    setShowUpload(newShowUpload);
    
    // Update URL without refreshing the page
    const url = newShowUpload ? '/chat?upload=true' : '/chat';
    navigate(url, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex flex-col mt-16 pb-4">
        <div className="container-custom flex-1 flex flex-col">
          <div className="glass-card my-6 rounded-xl overflow-hidden shadow-xl flex-1">
            <ChatInterface 
              showUploadPanel={showUpload} 
              onToggleUpload={toggleUploadPanel}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
