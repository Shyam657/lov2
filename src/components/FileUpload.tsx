import { useState, useRef } from 'react';
import { Upload, X, FileText, FileImage, File } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

const FileUpload = ({ 
  onUploadComplete, 
  maxFiles = 5, 
  acceptedTypes = ['.pdf', '.docx', '.txt']
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFiles = (fileList: File[]) => {
    if (files.length + fileList.length > maxFiles) {
      toast.error(`You can only upload a maximum of ${maxFiles} files.`);
      return false;
    }

    const acceptedTypesArray = acceptedTypes.map(type => type.replace('.', ''));
    const invalidFiles = fileList.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      return !acceptedTypesArray.includes(extension);
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid file type(s). Accepted types: ${acceptedTypes.join(', ')}`);
      return false;
    }

    const oversizedFiles = fileList.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files exceed the 10MB size limit.');
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (validateFiles(droppedFiles)) {
      const newFiles = [...files, ...droppedFiles];
      setFiles(newFiles);
      
      onUploadComplete(newFiles);
      toast.success(`${droppedFiles.length} file(s) added successfully.`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    if (validateFiles(selectedFiles)) {
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      
      onUploadComplete(newFiles);
      toast.success(`${selectedFiles.length} file(s) added successfully.`);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    onUploadComplete(newFiles);
    toast.info('File removed.');
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText size={20} className="text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText size={20} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage size={20} />;
      default:
        return <File size={20} />;
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "w-full p-8 border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-white/10 hover:border-white/20 bg-secondary/40"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept={acceptedTypes.join(',')}
          className="hidden"
        />
        
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Upload size={28} className="text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">
          {isDragging ? 'Drop files here' : 'Upload your documents'}
        </h3>
        
        <p className="text-foreground/70 mb-2">
          Drag and drop files here or click to browse
        </p>
        
        <p className="text-sm text-foreground/50">
          Supported formats: {acceptedTypes.join(', ')} (max {maxFiles} files, 10MB each)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 glass-card p-4">
          <h4 className="font-medium mb-3">Uploaded Files ({files.length}/{maxFiles})</h4>
          
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-secondary/40 rounded-lg p-3">
                <div className="flex items-center space-x-3 truncate">
                  {getFileIcon(file.name)}
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-foreground/50">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-foreground/50 hover:text-foreground/80 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
