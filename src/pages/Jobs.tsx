import { useEffect, useState } from 'react';
import { useJobStore } from '@/store/jobStore';
import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, CheckCircle2 } from 'lucide-react';

const Jobs = () => {
  const { user } = useAuthStore();
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
      alert('Please login to apply for jobs');
      return;
    }
    try {
      await applyJob(jobId);
      setAppliedJobs(prev => new Set([...prev, jobId]));
      alert('Applied successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to apply');
    }
  };

  return (
    <MainLayout
      rightSidebar={
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-2">Job Seeker Guidance</h3>
              <p className="text-xs text-gray-500 mb-4">Recommended based on your profile and search history</p>
              <div className="space-y-3">
                 <div className="flex items-start gap-2">
                    <div className="bg-blue-100 p-1 rounded"><Briefcase size={14} className="text-blue-600"/></div>
                    <div>
                        <p className="text-xs font-semibold text-gray-800">I want to improve my resume</p>
                        <p className="text-[10px] text-gray-500">Explore our resume builder</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-2">
                    <div className="bg-green-100 p-1 rounded"><DollarSign size={14} className="text-green-600"/></div>
                    <div>
                        <p className="text-xs font-semibold text-gray-800">Salary insights</p>
                        <p className="text-[10px] text-gray-500">See what you are worth</p>
                    </div>
                 </div>
              </div>
          </div>
      }
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Find your dream job</h1>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search by title, skill, or company" 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="bg-accent hover:bg-red-700 text-white">
              <Search size={18} className="mr-2" />
              Search
            </Button>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option>All</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Remote</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
            <Input
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-crimson-red"></div>
          <p className="mt-2 text-sm text-gray-500">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs available</h3>
          <p className="text-gray-600 mb-4">
            {jobs.length === 0 
              ? "There are no job listings at the moment. Check back later!" 
              : "No jobs match your search criteria. Try different keywords."}
          </p>
          {jobs.length === 0 && searchTerm && (
            <Button 
              onClick={() => setSearchTerm('')} 
              variant="outline"
              className="mt-2"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
            {filteredJobs.map((job, index) => (
                <div 
                  key={job._id} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover-lift transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-400">
                            {job.logo ? <img src={job.logo} className="w-full h-full object-cover" /> : job.company.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-accent">{job.title}</h3>
                            <p className="text-sm font-semibold text-gray-900">{job.company}</p>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                                {job.salary && <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</span>}
                                <span className="flex items-center gap-1"><Clock size={14} /> {new Date(job.postedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                        </div>
                        <div>
                            {appliedJobs.has(job._id) ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                disabled
                                className="text-green-600 border-green-600 cursor-not-allowed"
                              >
                                <CheckCircle2 size={14} className="mr-1" />
                                Applied
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleApply(job._id)} 
                                variant="outline" 
                                className="text-crimson-red border-crimson-red hover:bg-crimson-red hover:text-white transition-all duration-300"
                              >
                                Apply
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
