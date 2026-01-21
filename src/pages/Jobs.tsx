import { useEffect, useState } from 'react';
import { useJobStore } from '@/store/jobStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';

const Jobs = () => {
  const { jobs, fetchJobs, applyJob, isLoading } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Find your dream job</h1>
        <div className="flex gap-2">
            <Input 
                placeholder="Search by title, skill, or company" 
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="bg-accent hover:bg-red-700">Search</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading jobs...</div>
      ) : (
        <div className="space-y-4">
            {filteredJobs.map(job => (
                <div key={job._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
                            <Button size="sm" onClick={() => applyJob(job._id)} variant="outline" className="text-accent border-accent hover:bg-red-50">
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
            {filteredJobs.length === 0 && (
                <div className="text-center py-10 text-gray-500">No jobs found matching your criteria.</div>
            )}
        </div>
      )}
    </MainLayout>
  );
};

export default Jobs;
