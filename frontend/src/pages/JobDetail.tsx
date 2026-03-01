import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { useToastStore } from '@/store/toastStore';
import { useI18n } from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import BookmarkButton from '@/components/BookmarkButton';
import AIJobMatcher from '@/components/jobs/AIJobMatcher';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  MessageSquare,
  Mail,
  Building2,
  Calendar,
  Users,
  FileText
} from 'lucide-react';
import { api } from '@/lib/utils';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { applyJob, isLoading } = useJobStore();
  const toast = useToastStore();
  const { t } = useI18n();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await api.getJob(id);
        if (response.success && response.data) {
          setJob(response.data);
          if (user && response.data.applicants?.some((appId: any) => appId.toString() === user._id)) {
            setApplied(true);
          }
        } else {
          toast.error('Job not found');
          navigate('/jobs');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load job');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id, user, navigate, toast]);

  const handleApply = async () => {
    if (!user) {
      toast.error(t('jobs.pleaseLogin'));
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      await applyJob(id);
      setApplied(true);
      toast.success(t('toast.jobApplied'));
    } catch (error: any) {
      toast.error(error.message || t('toast.jobApplyFailed'));
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.error(t('jobs.pleaseLogin'));
      navigate('/login');
      return;
    }

    if (job?.postedBy) {
      navigate(`/messaging?user=${job.postedBy}`);
    } else {
      setShowContact(true);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-red" />
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Job not found</p>
          <Button onClick={() => navigate('/jobs')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {job.logo ? (
                      <img src={job.logo} className="w-full h-full object-cover rounded-lg" alt={job.company} />
                    ) : (
                      job.company.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building2 size={16} />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={16} />
                        {job.type}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={16} />
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {user && (
                  <div className="mt-4">
                    <AIJobMatcher
                      jobId={job._id}
                      jobDescription={job.description || ''}
                      jobRequirements={job.requirements || []}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <BookmarkButton type="job" itemId={job._id} />
                {applied ? (
                  <Button
                    variant="outline"
                    disabled
                    className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400"
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    {t('jobs.applied')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleApply}
                    disabled={isLoading}
                    className="bg-crimson-red hover:bg-fire-red text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <FileText size={16} className="mr-2" />
                        {t('jobs.apply')}
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleContact}
                  className="w-full sm:w-auto"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Contact Recruiter
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Job Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} />
                <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
              </div>
              {job.applicants && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users size={16} />
                  <span>{job.applicants.length} applicants</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Job Description</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-crimson-red mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
