import { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  FileText,
  Briefcase,
  MessageSquare,
  DollarSign,
  RefreshCw,
  Ban,
  UserCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  Crown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/utils';
import { useToastStore } from '@/store/toastStore';

type AdminTab = 'overview' | 'users' | 'posts' | 'articles' | 'jobs';

const tabButtonClass = (active: boolean) =>
  `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
    active
      ? 'bg-crimson-red text-white'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
  }`;

const Admin = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [posts, setPosts] = useState<any[]>([]);
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [articles, setArticles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadOverview(),
          loadUsers(),
          loadPosts(),
          loadArticles(),
          loadJobs(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAdmin]);

  const loadOverview = async () => {
    try {
      const res = await api.getAdminOverview();
      if (res.success) setOverview(res.data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load overview');
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.getAdminUsers({ page: 1, limit: 100, search: userSearch || undefined });
      if (res.success) setUsers(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load users');
    }
  };

  const loadPosts = async () => {
    try {
      const status = postStatusFilter === 'all' ? undefined : postStatusFilter;
      const res = await api.getAdminPosts({ page: 1, limit: 100, status });
      if (res.success) setPosts(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load posts');
    }
  };

  const loadArticles = async () => {
    try {
      const res = await api.getAdminArticles({ page: 1, limit: 100 });
      if (res.success) setArticles(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load articles');
    }
  };

  const loadJobs = async () => {
    try {
      const res = await api.getAdminJobs({ page: 1, limit: 100 });
      if (res.success) setJobs(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load jobs');
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadOverview(), loadUsers(), loadPosts(), loadArticles(), loadJobs()]);
      toast.success('Admin data refreshed');
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (target: any) => {
    try {
      if (target.isBanned) {
        await api.unbanAdminUser(target._id);
      } else {
        await api.banAdminUser(target._id);
      }
      await loadUsers();
      await loadOverview();
      toast.success(target.isBanned ? 'User unbanned' : 'User banned');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update ban state');
    }
  };

  const handleRoleToggle = async (target: any) => {
    try {
      const nextRole = target.role === 'admin' ? 'user' : 'admin';
      await api.updateAdminUserRole(target._id, nextRole);
      await loadUsers();
      toast.success('User role updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update role');
    }
  };

  const handleSubscriptionToggle = async (target: any) => {
    try {
      const currentPlan = target.subscription?.plan || 'free';
      const nextPlan = currentPlan === 'premium' ? 'free' : 'premium';
      await api.updateAdminUserSubscription(target._id, {
        plan: nextPlan,
        status: 'active',
      });
      await loadUsers();
      await loadOverview();
      toast.success('User subscription updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update subscription');
    }
  };

  const handlePostStatus = async (postId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const reason = status === 'rejected' ? prompt('Reason for rejection (optional):') || '' : undefined;
      await api.updateAdminPostStatus(postId, status, reason);
      await loadPosts();
      await loadOverview();
      toast.success('Post updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await api.deleteAdminPost(postId);
      await loadPosts();
      await loadOverview();
      toast.success('Post deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete post');
    }
  };

  const handleToggleArticlePublish = async (articleId: string) => {
    try {
      await api.toggleAdminArticlePublish(articleId);
      await loadArticles();
      toast.success('Article publish state updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update article');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Delete this article permanently?')) return;
    try {
      await api.deleteAdminArticle(articleId);
      await loadArticles();
      await loadOverview();
      toast.success('Article deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete article');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Delete this job permanently?')) return;
    try {
      await api.deleteAdminJob(jobId);
      await loadJobs();
      await loadOverview();
      toast.success('Job deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete job');
    }
  };

  const tabHeader = useMemo(
    () => (
      <div className="flex flex-wrap gap-2">
        <button className={tabButtonClass(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={tabButtonClass(activeTab === 'users')} onClick={() => setActiveTab('users')}>Users</button>
        <button className={tabButtonClass(activeTab === 'posts')} onClick={() => setActiveTab('posts')}>Posts</button>
        <button className={tabButtonClass(activeTab === 'articles')} onClick={() => setActiveTab('articles')}>Articles</button>
        <button className={tabButtonClass(activeTab === 'jobs')} onClick={() => setActiveTab('jobs')}>Jobs</button>
      </div>
    ),
    [activeTab]
  );

  if (!user) return null;

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto py-16 text-center">
          <XCircle className="mx-auto text-red-500 mb-4" size={56} />
          <h1 className="text-2xl font-bold mb-2">Access denied</h1>
          <p className="text-gray-600 dark:text-gray-300">You need admin privileges to view this page.</p>
          <Button className="mt-6" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-10 px-2 sm:px-4 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <Shield size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Admin Management Console</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Manage users, content, jobs, subscriptions, and moderation actions.</p>
              </div>
            </div>

            <Button onClick={refreshAll} disabled={loading} className="flex items-center gap-2">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>

          {tabHeader}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard icon={<Users size={18} />} label="Users" value={overview?.usersCount ?? 0} />
            <OverviewCard icon={<Ban size={18} />} label="Banned Users" value={overview?.bannedUsersCount ?? 0} />
            <OverviewCard icon={<MessageSquare size={18} />} label="Posts" value={overview?.postsCount ?? 0} />
            <OverviewCard icon={<CheckCircle2 size={18} />} label="Pending Posts" value={overview?.pendingPostsCount ?? 0} />
            <OverviewCard icon={<FileText size={18} />} label="Articles" value={overview?.articlesCount ?? 0} />
            <OverviewCard icon={<Briefcase size={18} />} label="Jobs" value={overview?.jobsCount ?? 0} />
            <OverviewCard icon={<Crown size={18} />} label="Premium Users" value={overview?.premiumUsersCount ?? 0} />
            <OverviewCard icon={<DollarSign size={18} />} label="Revenue Signals" value={(overview?.premiumUsersCount ?? 0) * 9.99} suffix="USD/mo" />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email"
                className="max-w-sm"
              />
              <Button variant="outline" onClick={loadUsers}>Search</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3">User</th>
                    <th className="text-left py-3">Role</th>
                    <th className="text-left py-3">Subscription</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-right py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-100 dark:border-gray-700/60">
                      <td className="py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>
                      <td className="py-3">{u.role}</td>
                      <td className="py-3">{u.subscription?.plan || 'free'} / {u.subscription?.status || 'active'}</td>
                      <td className="py-3">{u.isBanned ? 'Banned' : 'Active'}</td>
                      <td className="py-3">
                        <div className="flex justify-end flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleRoleToggle(u)}>
                            {u.role === 'admin' ? 'Set User' : 'Set Admin'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleSubscriptionToggle(u)}>
                            {u.subscription?.plan === 'premium' ? 'Set Free' : 'Set Premium'}
                          </Button>
                          <Button size="sm" variant={u.isBanned ? 'secondary' : 'destructive'} onClick={() => handleBanToggle(u)}>
                            {u.isBanned ? <UserCheck size={14} className="mr-1" /> : <Ban size={14} className="mr-1" />}
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  className={tabButtonClass(postStatusFilter === status)}
                  onClick={() => {
                    setPostStatusFilter(status);
                    setTimeout(loadPosts, 0);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{p.user?.name || 'Unknown user'}</div>
                      <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                      <p className="text-sm mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{p.content}</p>
                      {p.rejectedReason && (
                        <p className="text-xs text-red-600 mt-1">Reason: {p.rejectedReason}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => handlePostStatus(p._id, 'approved')}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => handlePostStatus(p._id, 'pending')}>Set Pending</Button>
                      <Button size="sm" variant="secondary" onClick={() => handlePostStatus(p._id, 'rejected')}>Reject</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeletePost(p._id)}>
                        <Trash2 size={14} className="mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3">Title</th>
                    <th className="text-left py-3">Author</th>
                    <th className="text-left py-3">Category</th>
                    <th className="text-left py-3">Published</th>
                    <th className="text-right py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => (
                    <tr key={a._id} className="border-b border-gray-100 dark:border-gray-700/60">
                      <td className="py-3 font-semibold text-gray-900 dark:text-white">{a.title}</td>
                      <td className="py-3">{a.author?.name || 'Unknown'}</td>
                      <td className="py-3">{a.category}</td>
                      <td className="py-3">{a.isPublished ? 'Yes' : 'No'}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleToggleArticlePublish(a._id)}>
                            {a.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteArticle(a._id)}>
                            <Trash2 size={14} className="mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3">Title</th>
                    <th className="text-left py-3">Company</th>
                    <th className="text-left py-3">Type</th>
                    <th className="text-left py-3">Posted by</th>
                    <th className="text-left py-3">Applicants</th>
                    <th className="text-right py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j._id} className="border-b border-gray-100 dark:border-gray-700/60">
                      <td className="py-3 font-semibold text-gray-900 dark:text-white">{j.title}</td>
                      <td className="py-3">{j.company}</td>
                      <td className="py-3">{j.type}</td>
                      <td className="py-3">{j.postedBy?.name || 'Unknown'}</td>
                      <td className="py-3">{Array.isArray(j.applicants) ? j.applicants.length : 0}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteJob(j._id)}>
                            <Trash2 size={14} className="mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

const OverviewCard = ({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number; suffix?: string }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center gap-3 mb-2 text-crimson-red">{icon}</div>
    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}{suffix ? ` ${suffix}` : ''}</div>
  </div>
);

export default Admin;
