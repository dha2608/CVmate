import { useMemo, useState }from 'react';
import { useNavigate }from 'react-router-dom';
import { useResumeStore }from '@/store/resumeStore';
import { Button }from '@/components/ui/button';
import { Input }from '@/components/ui/input';
import { Textarea }from '@/components/ui/textarea';
import { Save, Download, ArrowLeft, FileText }from 'lucide-react';

const Builder = () => {
  const navigate = useNavigate();
  const { currentResume, updatePersonalInfo, updateField }= useResumeStore((state) => ({
    currentResume: state.currentResume,
    updatePersonalInfo: state.updatePersonalInfo,
    updateField: state.updateField,
  }));

  const [saving, setSaving] = useState(false);

  const previewName = useMemo(() => currentResume.personalInfo.fullName || 'YOUR NAME', [currentResume.personalInfo.fullName]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // local draft is already persisted via zustand persist
      await new Promise((resolve) => setTimeout(resolve, 300));
    }finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">CV Builder</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave}disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleDownload}className="bg-crimson-red hover:bg-fire-red text-white">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Information</h2>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
              <Input
                value={currentResume.personalInfo.fullName || ''}
                onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
              <Input
                value={currentResume.personalInfo.email || ''}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</label>
              <Input
                value={currentResume.personalInfo.phone || ''}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                placeholder="+84 ..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Summary</label>
              <Textarea
                value={currentResume.summary || ''}
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="Write your professional summary..."
                className="min-h-[160px]"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Live Preview
            </h2>

            <div id="resume-preview" className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{previewName}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{currentResume.personalInfo.email || 'you@example.com'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentResume.personalInfo.phone || '+84 ...'}</p>

              {(currentResume.summary || '').trim() && (
                <div className="mt-6">
                  <h3 className="text-sm uppercase tracking-wider font-bold text-crimson-red mb-2">Summary</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentResume.summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
