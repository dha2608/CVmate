import { useEffect, useState } from 'react';
import { useJobStore } from '@/store/jobStore';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, CheckCircle2, Loader2 } from 'lucide-react';

const Jobs = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const toast = useToastStore();
  const { jobs, fetchJobs, applyJob, isLoading, pagination } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobs({ page: 1, limit: 20 });
  }, []);

  useEffect(() => {
    // Check which jobs user has applied to
    if (user && jobs.length > 0) {
      const applied = new Set<string>();
      jobs.forEach(job => {
        if (job.applicants?.some((id: any) => id.toString() === user._id)) {
          applied.add(job._id);
        }
      });
      setAppliedJobs(applied);
    }
  }, [jobs, user]);

  const handleSearch = () => {
    fetchJobs({
      page: 1,
      limit: 20,
      search: searchTerm || undefined,
      type: selectedType !== 'All' ? selectedType : undefined,
      location: locationFilter || undefined,
    });
  };

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast.error(t('jobs.pleaseLogin'));
      return;
    }
    try {
      await applyJob(jobId);
      setAppliedJobs(prev => new Set([...prev, jobId]));
      toast.success(t('toast.jobApplied'));
    } catch (error: any) {
      toast.error(error.message || t('toast.jobApplyFailed'));
    }
  };

  return (
    <MainLayout
      rightSidebar={
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('jobs.jobSeekerGuidance')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t('jobs.recommendedBasedOn')}</p>
              <div className="space-y-3">
                 <div className="flex items-start gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded"><Briefcase size={14} className="text-blue-600 dark:text-blue-400"/></div>
                    <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('jobs.improveResume')}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('jobs.exploreBuilder')}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-2">
                    <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded"><DollarSign size={14} className="text-green-600 dark:text-green-400"/></div>
                    <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('jobs.salaryInsights')}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('jobs.seeWhatWorth')}</p>
                    </div>
                 </div>
              </div>
          </div>
      }
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('jobs.findDreamJob')}</h1>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <Input 
                placeholder={t('jobs.searchPlaceholder')} 
                className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="bg-accent hover:bg-red-700 text-white">
              <Search size={18} className="mr-2" />
              {t('jobs.search')}
            </Button>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('jobs.filters')}</span>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option>{t('jobs.all')}</option>
              <option>{t('jobs.fullTime')}</option>
              <option>{t('jobs.partTime')}</option>
              <option>{t('jobs.remote')}</option>
              <option>{t('jobs.contract')}</option>
              <option>{t('jobs.internship')}</option>
            </select>
            <Input
              placeholder={t('jobs.location')}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-48 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="inline-block animate-spin h-8 w-8 text-crimson-red" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('jobs.loadingJobs')}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Briefcase className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('jobs.noJobsAvailable')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedType !== t('jobs.all') || locationFilter
              ? t('jobs.noJobsMatch')
              : t('jobs.noJobsAtMoment')}
          </p>
          {(searchTerm || selectedType !== t('jobs.all') || locationFilter) && (
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedType(t('jobs.all'));
                setLocationFilter('');
                fetchJobs({ page: 1, limit: 20 });
              }} 
              variant="outline"
              className="mt-2"
            >
              {t('jobs.clearSearch')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
            {jobs.map((job, index) => (
                <div 
                  key={job._id} 
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover-lift transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
                            {job.logo ? <img src={job.logo} className="w-full h-full object-cover rounded" alt={job.company} /> : job.company.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-accent dark:text-red-400">{job.title}</h3>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.company}</p>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                                {job.salary && <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</span>}
                                <span className="flex items-center gap-1"><Clock size={14} /> {new Date(job.postedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                            {appliedJobs.has(job._id) ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                disabled
                                className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 cursor-not-allowed"
                              >
                                <CheckCircle2 size={14} className="mr-1" />
                                {t('jobs.applied')}
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleApply(job._id)} 
                                variant="outline" 
                                className="text-crimson-red dark:text-red-400 border-crimson-red dark:border-red-400 hover:bg-crimson-red hover:text-white dark:hover:bg-red-500 transition-all duration-300"
                              >
                                {t('jobs.apply')}
                              </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </MainLayout>
  );
};

export default Jobs;
