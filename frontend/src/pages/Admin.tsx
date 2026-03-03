import { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UsersRound,
  NotebookText,
  BriefcaseBusiness,
  PenLine,
  Wallet,
  RotateCw,
  Ban,
  UserCheck,
  Trash2,
  CircleCheckBig,
  XCircle,
  Gem,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/utils';
import { useToastStore } from '@/store/toastStore';
import { confirmDialog } from '@/components/ui/confirm-dialog';
import { useI18n } from '@/store/i18nStore';

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
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [posts, setPosts] = useState<any[]>([]);
  const [postStatusFilter, setPostStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');

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
        await Promise.all([loadOverview(), loadUsers(), loadPosts(), loadArticles(), loadJobs()]);
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
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.getAdminUsers({ page: 1, limit: 100, search: userSearch || undefined });
      if (res.success) setUsers(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const loadPosts = async () => {
    try {
      const status = postStatusFilter === 'all' ? undefined : postStatusFilter;
      const res = await api.getAdminPosts({ page: 1, limit: 100, status });
      if (res.success) setPosts(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const loadArticles = async () => {
    try {
      const res = await api.getAdminArticles({ page: 1, limit: 100 });
      if (res.success) setArticles(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const loadJobs = async () => {
    try {
      const res = await api.getAdminJobs({ page: 1, limit: 100 });
      if (res.success) setJobs(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadOverview(), loadUsers(), loadPosts(), loadArticles(), loadJobs()]);
      toast.success(t('admin.dataRefreshed'));
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
      toast.success(target.isBanned ? t('admin.userUnbanned') : t('admin.userBanned'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const handleRoleToggle = async (target: any) => {
    try {
      const nextRole = target.role === 'admin' ? 'user' : 'admin';
      await api.updateAdminUserRole(target._id, nextRole);
      await loadUsers();
      toast.success(t('admin.roleUpdated'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
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
      toast.success(t('admin.subscriptionUpdated'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const handlePostStatus = async (postId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      let reason: string | undefined = undefined;
      if (status === 'rejected') {
        const input = await confirmDialog({
          message: t('admin.rejectReason'),
          title: t('admin.rejectPostTitle'),
          confirmText: t('admin.reject'),
          cancelText: t('admin.cancel'),
          variant: 'destructive',
          requireInput: true,
          inputPlaceholder: t('admin.rejectReason'),
          inputLabel: t('admin.rejectionReason'),
        });
        if (input === false) return;
        reason = typeof input === 'string' ? input : undefined;
      }
      await api.updateAdminPostStatus(postId, status, reason);
      await loadPosts();
      await loadOverview();
      toast.success(t('admin.postUpdated'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const handleDeletePost = async (postId: string) => {
    const confirmed = await confirmDialog({
      message: t('admin.deletePostConfirm'),
      title: t('admin.deletePostTitle'),
      confirmText: t('admin.delete'),
      cancelText: t('admin.cancel'),
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await api.deleteAdminPost(postId);
      await loadPosts();
      await loadOverview();
      toast.success(t('admin.postDeleted'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const handleToggleArticlePublish = async (articleId: string) => {
    try {
      await api.toggleAdminArticlePublish(articleId);
      await loadArticles();
      toast.success(t('admin.articlePublishUpdated'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    const confirmed = await confirmDialog({
      message: t('admin.deleteArticleConfirm'),
      title: t('admin.deleteArticleTitle'),
      confirmText: t('admin.delete'),
      cancelText: t('admin.cancel'),
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await api.deleteAdminArticle(articleId);
      await loadArticles();
      await loadOverview();
      toast.success(t('admin.articleDeleted'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const confirmed = await confirmDialog({
      message: t('admin.deleteJobConfirm'),
      title: t('admin.deleteJobTitle'),
      confirmText: t('admin.delete'),
      cancelText: t('admin.cancel'),
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await api.deleteAdminJob(jobId);
      await loadJobs();
      await loadOverview();
      toast.success(t('admin.jobDeleted'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.loadFailed'));
    }
  };

  const tabHeader = useMemo(
    () => (
      <div className="flex flex-wrap gap-2">
        <button
          className={tabButtonClass(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          {t('admin.overview')}
        </button>
        <button
          className={tabButtonClass(activeTab === 'users')}
          onClick={() => setActiveTab('users')}
        >
          {t('admin.users')}
        </button>
        <button
          className={tabButtonClass(activeTab === 'posts')}
          onClick={() => setActiveTab('posts')}
        >
          {t('admin.posts')}
        </button>
        <button
          className={tabButtonClass(activeTab === 'articles')}
          onClick={() => setActiveTab('articles')}
        >
          {t('admin.articles')}
        </button>
        <button
          className={tabButtonClass(activeTab === 'jobs')}
          onClick={() => setActiveTab('jobs')}
        >
          {t('admin.jobs')}
        </button>
      </div>
    ),
    [activeTab, t]
  );

  if (!user) return null;

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto py-16 text-center">
          <XCircle className="mx-auto text-red-500 mb-4" size={56} />
          <h1 className="text-2xl font-bold mb-2">{t('admin.accessDenied')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('admin.accessDeniedDesc')}</p>
          <Button className="mt-6" onClick={() => navigate('/dashboard')}>
            {t('admin.backToDashboard')}
          </Button>
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
                <ShieldCheck size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {t('admin.title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {t('admin.subtitle')}
                </p>
              </div>
            </div>

            <Button onClick={refreshAll} disabled={loading} className="flex items-center gap-2">
              <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
              {t('admin.refresh')}
            </Button>
          </div>

          {tabHeader}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard
              icon={<UsersRound size={18} />}
              label={t('admin.users')}
              value={overview?.usersCount ?? 0}
            />
            <OverviewCard
              icon={<Ban size={18} />}
              label={t('admin.bannedUsers')}
              value={overview?.bannedUsersCount ?? 0}
            />
            <OverviewCard
              icon={<PenLine size={18} />}
              label={t('admin.posts')}
              value={overview?.postsCount ?? 0}
            />
            <OverviewCard
              icon={<CircleCheckBig size={18} />}
              label={t('admin.pendingPosts')}
              value={overview?.pendingPostsCount ?? 0}
            />
            <OverviewCard
              icon={<NotebookText size={18} />}
              label={t('admin.articles')}
              value={overview?.articlesCount ?? 0}
            />
            <OverviewCard
              icon={<BriefcaseBusiness size={18} />}
              label={t('admin.jobs')}
              value={overview?.jobsCount ?? 0}
            />
            <OverviewCard
              icon={<Gem size={18} />}
              label={t('admin.premiumUsers')}
              value={overview?.premiumUsersCount ?? 0}
            />
            <OverviewCard
              icon={<Wallet size={18} />}
              label={t('admin.totalRevenue')}
              value={overview?.totalRevenue ?? 0}
              suffix="USD"
            />
            <OverviewCard
              icon={<Wallet size={18} />}
              label={t('admin.monthlySubs')}
              value={overview?.premiumMonthlyCount ?? 0}
              suffix={`× $8/mo`}
            />
            <OverviewCard
              icon={<Wallet size={18} />}
              label={t('admin.yearlySubs')}
              value={overview?.premiumYearlyCount ?? 0}
              suffix={`× $80/yr`}
            />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={t('admin.searchPlaceholder')}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={loadUsers}>
                {t('admin.search')}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3">{t('admin.user')}</th>
                    <th className="text-left py-3">{t('admin.role')}</th>
                    <th className="text-left py-3">{t('admin.subscription')}</th>
                    <th className="text-left py-3">{t('admin.status')}</th>
                    <th className="text-right py-3">{t('admin.actions')}</th>
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
                      <td className="py-3">
                        {u.subscription?.plan || 'free'} /{' '}
                        {u.subscription?.status || t('admin.active').toLowerCase()}
                      </td>
                      <td className="py-3">{u.isBanned ? t('admin.banned') : t('admin.active')}</td>
                      <td className="py-3">
                        <div className="flex justify-end flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleRoleToggle(u)}>
                            {u.role === 'admin' ? t('admin.setUser') : t('admin.setAdmin')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSubscriptionToggle(u)}
                          >
                            {u.subscription?.plan === 'premium'
                              ? t('admin.setFree')
                              : t('admin.setPremium')}
                          </Button>
                          <Button
                            size="sm"
                            variant={u.isBanned ? 'secondary' : 'destructive'}
                            onClick={() => handleBanToggle(u)}
                          >
                            {u.isBanned ? (
                              <UserCheck size={14} className="mr-1" />
                            ) : (
                              <Ban size={14} className="mr-1" />
                            )}
                            {u.isBanned ? t('admin.unban') : t('admin.ban')}
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
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  className={tabButtonClass(postStatusFilter === status)}
                  onClick={() => {
                    setPostStatusFilter(status);
                    setTimeout(loadPosts, 0);
                  }}
                >
                  {t(`admin.${status}`)}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3">{t('admin.user')}</th>
                    <th className="text-left py-3">{t('admin.content')}</th>
                    <th className="text-left py-3">{t('admin.status')}</th>
                    <th className="text-left py-3">{t('admin.created')}</th>
                    <th className="text-right py-3">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p._id} className="border-b border-gray-100 dark:border-gray-700/60">
                      <td className="py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.user?.name || t('admin.unknownUser')}
                        </div>
                        <div className="text-xs text-gray-500">{p.user?.email || ''}</div>
                      </td>
                      <td className="py-3 max-w-md">
                        <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                          {p.content || t('admin.noContent')}
                        </p>
                        {p.rejectedReason && (
                          <p className="text-xs text-red-600 mt-1">
                            {t('admin.reason')} {p.rejectedReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            p.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : p.status === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}
                        >
                          {t(`admin.${p.status || 'pending'}`)}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePostStatus(p._id, 'approved')}
                          >
                            {t('admin.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePostStatus(p._id, 'pending')}
                          >
                            {t('admin.pending')}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePostStatus(p._id, 'rejected')}
                          >
                            {t('admin.reject')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePost(p._id)}
                          >
                            <Trash2 size={14} className="mr-1" /> {t('admin.delete')}
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

        {activeTab === 'articles' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3">{t('admin.titleColumn')}</th>
                    <th className="text-left py-3">{t('admin.author')}</th>
                    <th className="text-left py-3">{t('admin.category')}</th>
                    <th className="text-left py-3">{t('admin.published')}</th>
                    <th className="text-right py-3">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => (
                    <tr key={a._id} className="border-b border-gray-100 dark:border-gray-700/60">
                      <td className="py-3 font-semibold text-gray-900 dark:text-white">
                        {a.title}
                      </td>
                      <td className="py-3">{a.author?.name || t('admin.unknownUser')}</td>
                      <td className="py-3">{a.category}</td>
                      <td className="py-3">{a.isPublished ? t('admin.yes') : t('admin.no')}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleArticlePublish(a._id)}
                          >
                            {a.isPublished ? t('admin.unpublish') : t('admin.publish')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteArticle(a._id)}
                          >
                            <Trash2 size={14} className="mr-1" /> {t('admin.delete')}
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
                    <th className="text-left py-3">{t('admin.titleColumn')}</th>
                    <th className="text-left py-3">{t('admin.company')}</th>
                    <th className="text-left py-3">{t('admin.type')}</th>
                    <th className="text-left py-3">{t('admin.postedBy')}</th>
                    <th className="text-left py-3">{t('admin.applicants')}</th>
                    <th className="text-right py-3">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j._id} className="border-b border-gray-100 dark:border-gray-700/60">
                      <td className="py-3 font-semibold text-gray-900 dark:text-white">
                        {j.title}
                      </td>
                      <td className="py-3">{j.company}</td>
                      <td className="py-3">{j.type}</td>
                      <td className="py-3">{j.postedBy?.name || t('admin.unknownUser')}</td>
                      <td className="py-3">
                        {Array.isArray(j.applicants) ? j.applicants.length : 0}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteJob(j._id)}
                          >
                            <Trash2 size={14} className="mr-1" /> {t('admin.delete')}
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

const OverviewCard = ({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center gap-3 mb-2 text-crimson-red">{icon}</div>
    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white">
      {value}
      {suffix ? ` ${suffix}` : ''}
    </div>
  </div>
);

export default Admin;
