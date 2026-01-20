import { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Builder = () => {
  const { currentResume, updatePersonalInfo, updateField } = useResumeStore();
  const [activeTab, setActiveTab] = useState('personal');

  const handleSave = async () => {
    // TODO: Implement save logic to backend
    alert('Save functionality coming soon!');
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Editor Side */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white z-10">
          <h2 className="text-2xl font-bold text-secondary">CV Builder</h2>
          <div className="space-x-2">
             <Button variant="outline" onClick={handleSave}>Save</Button>
             <Button onClick={handleDownload}>Download PDF</Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                {['Personal', 'Summary', 'Experience', 'Education', 'Skills'].map(tab => (
                    <button
                        key={tab}
                        className={`pb-2 px-1 text-sm font-medium transition-colors ${
                            activeTab === tab.toLowerCase() 
                            ? 'border-b-2 border-accent text-accent' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {activeTab === 'personal' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-medium">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input 
                                    value={currentResume.personalInfo.fullName} 
                                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input 
                                    value={currentResume.personalInfo.email} 
                                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                    placeholder="e.g. john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input 
                                    value={currentResume.personalInfo.phone} 
                                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                    placeholder="e.g. +1 234 567 890"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input 
                                    value={currentResume.personalInfo.address} 
                                    onChange={(e) => updatePersonalInfo('address', e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium">LinkedIn</label>
                                <Input 
                                    value={currentResume.personalInfo.linkedin} 
                                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                    placeholder="linkedin.com/in/johndoe"
                                />
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Website</label>
                                <Input 
                                    value={currentResume.personalInfo.website} 
                                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                                    placeholder="johndoe.com"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-medium">Professional Summary</h3>
                        <textarea 
                            className="w-full h-40 p-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={currentResume.summary}
                            onChange={(e) => updateField('summary', e.target.value)}
                            placeholder="Write a brief summary of your career..."
                        />
                        <div className="flex justify-end">
                            <Button variant="secondary" size="sm">AI Enhance</Button>
                        </div>
                    </div>
                )}

                {/* Placeholders for other tabs */}
                {(activeTab === 'experience' || activeTab === 'education' || activeTab === 'skills') && (
                    <div className="text-center py-10 text-gray-500">
                        Section under construction.
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Preview Side */}
      <div className="w-1/2 bg-neutral-100 p-8 overflow-y-auto flex justify-center">
        <div className="bg-white shadow-xl w-[210mm] min-h-[297mm] p-[20mm] text-sm leading-relaxed" id="resume-preview">
            {/* Header */}
            <header className="border-b-2 border-gray-900 pb-6 mb-6">
                <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wide mb-2">
                    {currentResume.personalInfo.fullName || 'YOUR NAME'}
                </h1>
                <div className="flex flex-wrap gap-3 text-gray-600 text-xs">
                    {currentResume.personalInfo.email && <span>{currentResume.personalInfo.email}</span>}
                    {currentResume.personalInfo.phone && <span>• {currentResume.personalInfo.phone}</span>}
                    {currentResume.personalInfo.address && <span>• {currentResume.personalInfo.address}</span>}
                    {currentResume.personalInfo.linkedin && <span>• {currentResume.personalInfo.linkedin}</span>}
                </div>
            </header>

            {/* Summary */}
            {currentResume.summary && (
                <section className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 mb-3 pb-1">Professional Summary</h2>
                    <p className="text-gray-700 whitespace-pre-line">{currentResume.summary}</p>
                </section>
            )}

            {/* Experience Placeholder in Preview */}
             <section className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 mb-3 pb-1">Experience</h2>
                    <div className="text-gray-400 italic">No experience added yet.</div>
             </section>
        </div>
      </div>
    </div>
  );
};

export default Builder;
