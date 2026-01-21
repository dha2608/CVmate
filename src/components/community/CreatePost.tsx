import { useState } from 'react';
import { useCommunityStore } from '@/store/communityStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CreatePost = () => {
  const { createPost } = useCommunityStore();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    await createPost(content, imageUrl);
    setContent('');
    setImageUrl('');
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          rows={3}
          placeholder="Share your career updates or ask for CV feedback..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-2">
            <Input 
                placeholder="Image URL (optional)" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 text-sm"
            />
            <Button 
                type="submit" 
                disabled={isLoading || !content.trim()}
                className="bg-accent hover:bg-red-700 text-white"
            >
            {isLoading ? 'Posting...' : 'Post'}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
