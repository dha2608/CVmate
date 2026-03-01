import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useJobStore } from '@/store/jobStore';

import { useAuthStore } from '@/store/authStore';

import { useI18n } from '@/store/i18nStore';

import { useToastStore } from '@/store/toastStore';

import { useBookmarkStore } from '@/store/bookmarkStore';

import { api } from '@/lib/utils';

import MainLayout from '@/components/layout/MainLayout';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import BookmarkButton from '@/components/BookmarkButton';

import AIJobMatcher from '@/components/jobs/AIJobMatcher';

import VirtualList from '@/components/VirtualList';

import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, CheckCircle2, Loader2, ChevronDown, ChevronUp, X, Video, MessageSquare } from 'lucide-react';

import { validateJobPosting } from '@/utils/validation';



const Jobs = () => {

  const navigate = useNavigate();

  const { user } = useAuthStore();

  const { t } = useI18n();

  const toast = useToastStore();

  const { jobs, fetchJobs, applyJob, isLoading } = useJobStore();

  const { fetchBookmarks } = useBookmarkStore();



  const [searchTerm, setSearchTerm] = useState('');

  const [selectedType, setSelectedType] = useState<string>(t('jobs.all'));

  const [locationFilter, setLocationFilter] = useState('');

  const [salaryMin, setSalaryMin] = useState<number | undefined>();

  const [salaryMax, setSalaryMax] = useState<number | undefined>();

  const [experienceLevel, setExperienceLevel] = useState<string>('');

  const [companySize, setCompanySize] = useState<string>('');

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const [showPostJob, setShowPostJob] = useState(false);

  const [isPostingJob, setIsPostingJob] = useState(false);

  const [jobForm, setJobForm] = useState({

    title: '',

    company: '',

    location: '',

    type: 'Full-time',

    description: '',

    salary: '',

    requirements: '',

  });



  useEffect(() => {

    fetchJobs({ page: 1, limit: 20 });

    fetchBookmarks();

  }, [fetchJobs, fetchBookmarks]);



  useEffect(() => {

    if (user && jobs.length > 0) {

      const applied = new Set<string>();

      jobs.forEach((job) => {

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

      type: selectedType !== t('jobs.all') ? selectedType : undefined,

      location: locationFilter || undefined,

      salaryMin,

      salaryMax,

      experienceLevel: experienceLevel || undefined,

      companySize: companySize || undefined,

    });

  };



  const handleClearFilters = () => {

    setSearchTerm('');

    setSelectedType(t('jobs.all'));

    setLocationFilter('');

    setSalaryMin(undefined);

    setSalaryMax(undefined);

    setExperienceLevel('');

    setCompanySize('');

    fetchJobs({ page: 1, limit: 20 });

  };



  const handleApply = async (jobId: string) => {

    if (!user) {

      toast.error(t('jobs.pleaseLogin'));

      return;

    }

    try {

      await applyJob(jobId);

      setAppliedJobs((prev) => new Set([...prev, jobId]));

      toast.success(t('toast.jobApplied'));

    } catch (error: any) {

      toast.error(error.message || t('toast.jobApplyFailed'));

    }

  };



  const handleCreateJob = async () => {

    if (!user) {

      toast.error(t('jobs.pleaseLogin'));

      return;

    }



    const validation = validateJobPosting({

      title: jobForm.title,

      company: jobForm.company,

      description: jobForm.description,

      salary: jobForm.salary,

      location: jobForm.location,

      type: jobForm.type,

    });



    if (!validation.valid) {

      toast.error(validation.errors.join(', '));

      return;

    }



    setIsPostingJob(true);

    try {

      const payload = {

        title: jobForm.title.trim(),

        company: jobForm.company.trim(),

        location: jobForm.location.trim() || 'Remote',

        type: jobForm.type as any,

        description: jobForm.description.trim(),

        salary: jobForm.salary.trim() || undefined,

        requirements: jobForm.requirements

          ? jobForm.requirements.split('\n').map((r) => r.trim()).filter(Boolean)

          : [],

      };

      const response = await api.createJob(payload);

      if (response.success) {

        toast.success(t('jobs.postSuccess') || 'Job posted successfully!');

        setShowPostJob(false);

        setJobForm({

          title: '',

          company: '',

          location: '',

          type: 'Full-time',

          description: '',

          salary: '',

          requirements: '',

        });

        fetchJobs({ page: 1, limit: 20 });

      }

    } catch (error: any) {

      toast.error(error.message || (t('jobs.postFailed') || 'Failed to post job.'));

    } finally {

      setIsPostingJob(false);

    }

  };



  return (

    <MainLayout

      rightSidebar={

        <div className="glass-card bg-white/90 dark:bg-gray-800/90 p-4 sm:p-5 sticky top-20 space-y-4">

          <div>

            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-1">{t('jobs.jobSeekerGuidance') || 'Job Seeker Guidance'}</h3>

            <p className="text-xs text-gray-500 dark:text-gray-400">{t('jobs.recommendedBasedOn') || 'Personalized recommendations for you'}</p>

          </div>

          <div className="space-y-3">

            <button onClick={() => navigate('/builder')} className="w-full flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group border border-blue-100 dark:border-blue-800">

              <div className="bg-blue-500 dark:bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">

                <Briefcase size={16} className="text-white" />

              </div>

              <div className="flex-1 text-left">

                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('jobs.improveResume') || 'Optimize Your Resume'}</p>

                <p className="text-xs text-gray-600 dark:text-gray-400">{t('jobs.exploreBuilder') || 'Use our ATS-friendly builder with AI enhancement'}</p>

              </div>

            </button>



            <button onClick={() => navigate('/interview')} className="w-full flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all group border border-purple-100 dark:border-purple-800">

              <div className="bg-purple-500 dark:bg-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">

                <Video size={16} className="text-white" />

              </div>

              <div className="flex-1 text-left">

                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('jobs.practiceInterview') || 'Practice Interview'}</p>

                <p className="text-xs text-gray-600 dark:text-gray-400">{t('jobs.aiInterview') || 'Prepare with AI-powered interview simulator'}</p>

              </div>

            </button>



            <button onClick={() => navigate('/blog')} className="w-full flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group border border-green-100 dark:border-green-800">

              <div className="bg-green-500 dark:bg-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform">

                <DollarSign size={16} className="text-white" />

              </div>

              <div className="flex-1 text-left">

                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('jobs.salaryInsights') || 'Salary Insights'}</p>

                <p className="text-xs text-gray-600 dark:text-gray-400">{t('jobs.seeWhatWorth') || 'Research market rates and negotiate better'}</p>

              </div>

            </button>



            <button onClick={() => navigate('/community')} className="w-full flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all group border border-orange-100 dark:border-orange-800">

              <div className="bg-orange-500 dark:bg-orange-600 p-2 rounded-lg group-hover:scale-110 transition-transform">

                <MessageSquare size={16} className="text-white" />

              </div>

              <div className="flex-1 text-left">

                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('jobs.getAdvice') || 'Get Career Advice'}</p>

                <p className="text-xs text-gray-600 dark:text-gray-400">{t('jobs.connectCommunity') || 'Connect with professionals and get tips'}</p>

              </div>

            </button>

          </div>

        </div>

      }

    >

      <div className="glass-card bg-white/90 dark:bg-gray-800/90 mb-6">

        <h1 className="text-heading-2 mb-6">{t('jobs.findDreamJob')}</h1>

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



          <div className="space-y-4">

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

                className="w-full sm:w-48 dark:bg-gray-700 dark:border-gray-600"

              />



              <Button

                variant="outline"

                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}

                className="flex items-center gap-2"

              >

                {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}

                {t('jobs.advancedFilters')}

              </Button>



              {(salaryMin || salaryMax || experienceLevel || companySize) && (

                <Button

                  variant="ghost"

                  size="sm"

                  onClick={handleClearFilters}

                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"

                >

                  <X size={14} className="mr-1" />

                  {t('jobs.clearFilters')}

                </Button>

              )}

            </div>



            {showAdvancedFilters && (

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 space-y-4 animate-fade-in">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div>

                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('jobs.salaryRange')}</label>

                    <div className="flex gap-2">

                      <Input

                        type="number"

                        placeholder={t('jobs.minSalary')}

                        value={salaryMin || ''}

                        onChange={(e) => setSalaryMin(e.target.value ? parseInt(e.target.value) : undefined)}

                        className="dark:bg-gray-700 dark:border-gray-600"

                      />

                      <Input

                        type="number"

                        placeholder={t('jobs.maxSalary')}

                        value={salaryMax || ''}

                        onChange={(e) => setSalaryMax(e.target.value ? parseInt(e.target.value) : undefined)}

                        className="dark:bg-gray-700 dark:border-gray-600"

                      />

                    </div>

                  </div>



                  <div>

                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('jobs.experienceLevel')}</label>

                    <select

                      value={experienceLevel}

                      onChange={(e) => setExperienceLevel(e.target.value)}

                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"

                    >

                      <option value="">{t('jobs.all')}</option>

                      <option value="Entry">{t('jobs.entry')}</option>

                      <option value="Mid">{t('jobs.mid')}</option>

                      <option value="Senior">{t('jobs.senior')}</option>

                      <option value="Executive">{t('jobs.executive')}</option>

                    </select>

                  </div>



                  <div>

                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('jobs.companySize')}</label>

                    <select

                      value={companySize}

                      onChange={(e) => setCompanySize(e.target.value)}

                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"

                    >

                      <option value="">{t('jobs.all')}</option>

                      <option value="Startup">{t('jobs.startup')}</option>

                      <option value="Small">{t('jobs.small')}</option>

                      <option value="Medium">{t('jobs.medium')}</option>

                      <option value="Large">{t('jobs.large')}</option>

                      <option value="Enterprise">{t('jobs.enterprise')}</option>

                    </select>

                  </div>

                </div>

              </div>

            )}

          </div>



          {user && (

            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">

              <div className="flex items-center justify-between mb-2">

                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('jobs.postJob') || 'Post a Job (Beta)'}</h2>

                <Button

                  variant="outline"

                  size="sm"

                  onClick={() => setShowPostJob((v) => !v)}

                  className="text-xs"

                >

                  {showPostJob ? (t('jobs.hideForm') || 'Hide Form') : (t('jobs.showPostForm') || 'Show Post Form')}

                </Button>

              </div>



              {showPostJob && (

                <div className="mt-2 space-y-3 bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200 dark:border-gray-600">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <Input

                      placeholder={t('jobs.jobTitlePlaceholder')}

                      value={jobForm.title}

                      onChange={(e) => setJobForm((f) => ({ ...f, title: e.target.value }))}

                      className="dark:bg-gray-700 dark:border-gray-600 text-xs sm:text-sm"

                      required

                    />

                    <Input

                      placeholder={t('jobs.companyPlaceholder')}

                      value={jobForm.company}

                      onChange={(e) => setJobForm((f) => ({ ...f, company: e.target.value }))}

                      className="dark:bg-gray-700 dark:border-gray-600 text-xs sm:text-sm"

                      required

                    />

                    <Input

                      placeholder={t('jobs.locationPlaceholder')}

                      value={jobForm.location}

                      onChange={(e) => setJobForm((f) => ({ ...f, location: e.target.value }))}

                      className="dark:bg-gray-700 dark:border-gray-600 text-xs sm:text-sm"

                    />

                    <select

                      value={jobForm.type}

                      onChange={(e) => setJobForm((f) => ({ ...f, type: e.target.value }))}

                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"

                    >

                      <option value="Full-time">Full-time</option>

                      <option value="Part-time">Part-time</option>

                      <option value="Remote">Remote</option>

                      <option value="Contract">Contract</option>

                      <option value="Internship">Internship</option>

                    </select>

                  </div>



                  <Input

                    placeholder={t('jobs.salaryPlaceholder')}

                    value={jobForm.salary}

                    onChange={(e) => setJobForm((f) => ({ ...f, salary: e.target.value }))}

                    className="dark:bg-gray-700 dark:border-gray-600 text-xs sm:text-sm"

                    type="text"

                  />



                  <textarea

                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-xs sm:text-sm p-2"

                    rows={3}

                    placeholder={t('jobs.descriptionPlaceholder')}

                    value={jobForm.description}

                    onChange={(e) => setJobForm((f) => ({ ...f, description: e.target.value }))}

                    required

                  />



                  <textarea

                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-xs sm:text-sm p-2"

                    rows={3}

                    placeholder={t('jobs.requirementsPlaceholder')}

                    value={jobForm.requirements}

                    onChange={(e) => setJobForm((f) => ({ ...f, requirements: e.target.value }))}

                  />



                  <div className="flex justify-end">

                    <Button size="sm" onClick={handleCreateJob} disabled={isPostingJob} className="bg-crimson-red hover:bg-fire-red text-white text-xs sm:text-sm">

                      {isPostingJob ? (

                        <>

                          <Loader2 size={14} className="mr-1 animate-spin" /> {t('jobs.posting') || 'Posting...'}

                        </>

                      ) : (

                        t('jobs.postJob') || 'Post Job'

                      )}

                    </Button>

                  </div>

                </div>

              )}

            </div>

          )}

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

          <VirtualList

            items={jobs}

            itemHeight={300}

            height={2000}

            renderItem={(job, index) => (

              <motion.div

                key={job._id}

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.2, delay: index * 0.02 }}

                className="glass-card bg-white/90 dark:bg-gray-800/90 hover:shadow-xl transition-all duration-300 cursor-pointer mb-4"

              >

                <div className="flex gap-4">

                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">

                    {job.logo ? <img src={job.logo} className="w-full h-full object-cover rounded" alt={job.company} loading="lazy" /> : job.company.charAt(0)}

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

                    {user && (

                      <div className="mt-3">

                        <AIJobMatcher

                          jobId={job._id}

                          jobDescription={job.description || ''}

                          jobRequirements={job.requirements || []}

                        />

                      </div>

                    )}

                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-2">

                    <BookmarkButton type="job" itemId={job._id} />

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

              </motion.div>

            )}

          />

        </div>

      )}

    </MainLayout>

  );

};



export default Jobs;

