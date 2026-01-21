import { useEffect } from 'react';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CreatePost from '@/components/community/CreatePost';
import PostCard from '@/components/community/PostCard';
import { Button } from '@/components/ui/button';

const Community = () => {
  const { user } = useAuthStore();
  const { posts, fetchPosts, isLoading } = useCommunityStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    fetchPosts();
  }, [user, navigate, fetchPosts]);

  if (!user) return null;

  return (
    <MainLayout>
        {/* Sort / Filter Bar (LinkedIn style) */}
        <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
                <div className="h-[1px] bg-gray-300 w-full flex-grow"></div>
                <span className="text-xs text-gray-500">Sort by: <span className="font-bold text-gray-700 cursor-pointer">Top</span></span>
            </div>
        </div>

        <CreatePost />

        {isLoading ? (
            <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-sm text-gray-500">Loading feed...</p>
            </div>
        ) : (
            <div className="space-y-4">
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}
                {posts.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <img src="https://illustrations.popsy.co/gray/surr-waiting.svg" alt="Empty" className="w-32 h-32 mx-auto opacity-50 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                        <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
                    </div>
                )}
            </div>
        )}
    </MainLayout>
  );
};

export default Community;
