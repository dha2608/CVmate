import { useState, useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, List, Image as ImageIcon, Eye, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/utils';
import { useToastStore } from '@/store/toastStore';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoSave?: boolean;
  onAutoSave?: (content: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your article...',
  autoSave = false,
  onAutoSave,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToastStore();

  // Auto-save draft
  useEffect(() => {
    if (!autoSave || !value.trim()) {return;}
    
    const timer = setTimeout(() => {
      const draft = {
        content: value,
        timestamp: Date.now(),
      };
      localStorage.setItem('article_draft', JSON.stringify(draft));
      onAutoSave?.(value);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [value, autoSave, onAutoSave]);

  // Load draft on mount
  useEffect(() => {
    if (autoSave && !value) {
      const savedDraft = localStorage.getItem('article_draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          // Only load if draft is less than 24 hours old
          if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
            onChange(draft.content);
          }
        } catch (e) {
          console.error('Failed to load draft:', e);
        }
      }
    }
  }, [autoSave, value, onChange]);

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {return;}

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleList = () => insertText('- ', '\n');

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;
      let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      if (apiBaseUrl.endsWith('/api')) {
        apiBaseUrl = apiBaseUrl.slice(0, -4);
      }

      const response = await fetch(`${apiBaseUrl}/api/upload/post-image`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.success && data.data?.url) {
        let imageUrl = data.data.url;
        if (!imageUrl.startsWith('http')) {
          const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
          const urlPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
          imageUrl = `${baseUrl}${urlPath}`;
        }

        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const imageMarkdown = `![${file.name}](${imageUrl})\n`;
          const newText = value.substring(0, start) + imageMarkdown + value.substring(start);
          onChange(newText);
          
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
          }, 0);
        }
        toast.success('Image uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        handleImageUpload(file);
      }
    }
  }, [handleImageUpload]);

  const renderMarkdown = (text: string): string => {
    // Simple markdown to HTML converter
    const html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
      .replace(/\n/g, '<br />');
    
    return html;
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          className="h-8 w-8 p-0"
          title="Bold"
          aria-label="Bold"
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          className="h-8 w-8 p-0"
          title="Italic"
          aria-label="Italic"
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleList}
          className="h-8 w-8 p-0"
          title="List"
          aria-label="List"
        >
          <List size={16} />
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-8 w-8 p-0"
          title="Insert Image"
          aria-label="Insert Image"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {handleImageUpload(file);}
          }}
          className="hidden"
        />
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="h-8"
        >
          <Eye size={16} className="mr-1" />
          {isPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Editor/Preview */}
      <div
        className={`relative border border-gray-200 dark:border-gray-700 rounded-lg ${
          isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-500/10 rounded-lg">
            <div className="text-center">
              <ImageIcon size={48} className="mx-auto text-blue-500 mb-2" />
              <p className="text-blue-600 dark:text-blue-400 font-semibold">Drop image here to upload</p>
            </div>
          </div>
        )}
        
        {isPreview ? (
          <div
            className="min-h-[300px] p-4 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[300px] p-4 border-0 resize-none focus:outline-none bg-transparent text-sm dark:text-white"
          />
        )}
      </div>

      {autoSave && value.trim() && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Save size={12} />
          Draft auto-saved
        </p>
      )}
    </div>
  );
};
