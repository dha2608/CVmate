import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BriefcaseBusiness,
  Users,
  ChevronDown,
  ChevronRight,
  CalendarClock,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageCircleMore,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type AppStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';

interface Applicant {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  headline?: string;
  currentRole?: string;
  skills?: string[];
}

interface Application {
  _id: string;
  job: string;
  applicant: Applicant;
  coverLetter?: string;
  status: AppStatus;
  recruiterNotes?: string;
  appliedAt: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  postedAt: string;
  applicants: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AppStatus,
  { label: string; icon: React.ReactNode; classes: string; badgeClasses: string }
> = {
  pending: {
    label: 'Pending',
    icon: <Clock size={14} />,
    classes:
      'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    badgeClasses: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200',
  },
  reviewing: {
    label: 'Reviewing',
    icon: <Eye size={14} />,
    classes:
      'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    badgeClasses: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200',
  },
  shortlisted: {
    label: 'Shortlisted',
    icon: <CheckCircle size={14} />,
    classes:
      'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    badgeClasses: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200',
  },
  rejected: {
    label: 'Rejected',
    icon: <XCircle size={14} />,
    classes:
      'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
    badgeClasses: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200',
  },
  accepted: {
    label: 'Accepted',
    icon: <CheckCircle size={14} />,
    classes:
      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
    badgeClasses: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200',
  },
};

const ALL_STATUSES: AppStatus[] = ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'];

const resolveAvatar = (url?: string) => {
  if (!url || !url.trim()) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))
    return url;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// ─── Sub-components ─────────────────────────────────────────────────────────────

interface ApplicantCardProps {
  app: Application;
  jobId: string;
  onStatusUpdated: (appId: string, newStatus: AppStatus) => void;
}

const ApplicantCard = ({ app, jobId, onStatusUpdated }: ApplicantCardProps) => {
  const [coverOpen, setCoverOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<AppStatus | null>(null);
  const [currentStatus, setCurrentStatus] = useState<AppStatus>(app.status);
  const [statusError, setStatusError] = useState('');

  const handleStatusChange = async (newStatus: AppStatus) => {
    if (newStatus === currentStatus) return;
    setUpdatingStatus(newStatus);
    setStatusError('');
    try {
      const res = await api.updateApplicationStatus(jobId, app._id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        onStatusUpdated(app._id, newStatus);
      }
    } catch {
      setStatusError('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const avatarSrc = resolveAvatar(app.applicant.avatar);
  const cfg = STATUS_CONFIG[currentStatus];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Applicant header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={app.applicant.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const fb = img.nextElementSibling as HTMLElement;
                if (fb) fb.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-bold text-sm ${avatarSrc ? 'hidden' : ''}`}
          >
            {app.applicant.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {app.applicant.name}
              </h4>
              {app.applicant.headline && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {app.applicant.headline}
                </p>
              )}
              {app.applicant.currentRole && !app.applicant.headline && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {app.applicant.currentRole}
                </p>
              )}
            </div>
            {/* Current status badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${cfg.classes}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          </div>

          {/* Skills */}
          {app.applicant.skills && app.applicant.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {app.applicant.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
              {app.applicant.skills.length > 5 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
                  +{app.applicant.skills.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Applied date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-3">
        <CalendarClock size={12} />
        Applied {formatDate(app.appliedAt)}
      </div>

      {/* Cover letter (collapsible) */}
      {app.coverLetter && (
        <div className="mb-3">
          <button
            onClick={() => setCoverOpen((o) => !o)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <MessageCircleMore size={13} />
            Cover letter
            {coverOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          <AnimatePresence>
            {coverOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 leading-relaxed border border-gray-200 dark:border-gray-600">
                  {app.coverLetter}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Status update buttons */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Update status:</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => {
            const sCfg = STATUS_CONFIG[s];
            const isActive = s === currentStatus;
            const isLoading = updatingStatus === s;
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updatingStatus !== null}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
                  isActive
                    ? `${sCfg.classes} ring-2 ring-offset-1 ring-current`
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {isLoading ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  sCfg.icon
                )}
                {sCfg.label}
              </button>
            );
          })}
        </div>
        {statusError && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{statusError}</p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Job card with expandable applicants panel ──────────────────────────────────

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getJobApplications(job._id);
      if (res.success) {
        setApplications(res.data);
        setFetched(true);
      }
    } catch {
      setError('Failed to load applicants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [job._id, fetched]);

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !fetched) fetchApplications();
  };

  const handleStatusUpdated = (appId: string, newStatus: AppStatus) => {
    setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a)));
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
      {/* Job header row */}
      <button
        onClick={handleToggle}
        className="w-full flex items-start gap-4 p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {job.company} · {job.location}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-full border border-red-200 dark:border-red-800">
                <Users size={12} />
                {job.applicants?.length ?? 0}
              </span>
              {expanded ? (
                <ChevronDown size={18} className="text-gray-400" />
              ) : (
                <ChevronRight size={18} className="text-gray-400" />
              )}
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
              {job.type}
            </span>
            {job.salary && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                {job.salary}
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Posted {formatDate(job.postedAt)}
            </span>
          </div>
        </div>
      </button>

      {/* Applicants panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 dark:border-gray-700 px-4 sm:px-5 py-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Users size={15} />
                Applicants ({applications.length})
              </h4>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    Loading applicants…
                  </span>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-6">
                  <p className="text-sm text-red-500 dark:text-red-400 mb-2">{error}</p>
                  <button
                    onClick={() => {
                      setFetched(false);
                      fetchApplications();
                    }}
                    className="text-xs text-blue-500 hover:text-blue-600 underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && applications.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No applicants yet for this position.
                  </p>
                </div>
              )}

              {!loading && !error && applications.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <AnimatePresence>
                    {applications.map((app) => (
                      <ApplicantCard
                        key={app._id}
                        app={app}
                        jobId={job._id}
                        onStatusUpdated={handleStatusUpdated}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────

const RecruiterDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobError, setJobError] = useState('');

  useEffect(() => {
    const fetchMyJobs = async () => {
      setLoadingJobs(true);
      setJobError('');
      try {
        const res = await api.getMyPostedJobs();
        if (res.success) setJobs(res.data);
      } catch {
        setJobError('Failed to load your posted jobs. Please refresh and try again.');
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchMyJobs();
  }, []);

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants?.length ?? 0), 0);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BriefcaseBusiness className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Recruiter Dashboard
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your job postings and review applicants
              </p>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <BriefcaseBusiness size={15} />
              Post a New Job
            </button>
          </div>

          {/* Stats bar */}
          {!loadingJobs && jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-4 flex items-center gap-4 flex-wrap"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm shadow-sm">
                <BriefcaseBusiness size={14} className="text-red-500" />
                <span className="font-semibold text-gray-900 dark:text-white">{jobs.length}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {jobs.length === 1 ? 'job posted' : 'jobs posted'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm shadow-sm">
                <Users size={14} className="text-blue-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalApplicants}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  total {totalApplicants === 1 ? 'applicant' : 'applicants'}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Body */}
        {loadingJobs && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading your jobs…</p>
          </div>
        )}

        {!loadingJobs && jobError && (
          <div className="text-center py-16">
            <BriefcaseBusiness className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">{jobError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-500 hover:text-red-600 underline"
            >
              Refresh page
            </button>
          </div>
        )}

        {!loadingJobs && !jobError && jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BriefcaseBusiness className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No jobs posted yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
              Post your first job listing to start receiving applications from talented candidates.
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <BriefcaseBusiness size={15} />
              Post Your First Job
            </button>
          </motion.div>
        )}

        {!loadingJobs && !jobError && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {jobs.map((job, i) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default RecruiterDashboard;
