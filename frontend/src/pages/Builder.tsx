import { useMemo, useState }from 'react';
import { useNavigate }from 'react-router-dom';
import { useResumeStore }from '@/store/resumeStore';
import { Button }from '@/components/ui/button';
import { Input }from '@/components/ui/input';
import { Textarea }from '@/components/ui/textarea';
import { ArrowLeft, Save, Download }from 'lucide-react';

const Builder = () => {
  const navigate = useNavigate();
  const {
    currentResume,
    updatePersonalInfo,
    updateField,
    addExperience,
    removeExperience,
    updateExperience,
  }= useResumeStore((state) => ({
    currentResume: state.currentResume,
    updatePersonalInfo: state.updatePersonalInfo,
    updateField: state.updateField,
    addExperience: state.addExperience,
    removeExperience: state.removeExperience,
    updateExperience: state.updateExperience,
  }));

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Safe-mode: local store save only (persist middleware already stores data)
      await new Promise((r) => setTimeout(r, 250));
    }finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const previewName = currentResume.personalInfo.fullName || 'Your Name';

  const previewContact = useMemo(() => {
    const p = currentResume.personalInfo;
    return [p.email, p.phone, p.address].filter(Boolean).join(' • ');
  }, [currentResume.personalInfo]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleSave}className="bg-crimson-red hover:bg-fire-red text-white">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4">
            <h2 className="font-bold">Personal Information</h2>
            <Input
              placeholder="Full name"
              value={currentResume.personalInfo.fullName}
              onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            />
            <Input
              placeholder="Email"
              value={currentResume.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
            />
            <Input
              placeholder="Phone"
              value={currentResume.personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            />
            <Textarea
              placeholder="Summary"
              value={currentResume.summary}
              onChange={(e) => updateField('summary', e.target.value)}
            />

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Experience</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addExperience({
                      id: `exp-${Date.now()}`,
                      company: '',
                      position: '',
                      startDate: '',
                      endDate: '',
                      description: '',
                    })
                  }
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {currentResume.experience.map((exp, idx) => (
                  <div key={exp.id || idx}className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, { ...exp, company: e.target.value })}
                    />
                    <Input
                      placeholder="Position"
                      value={exp.position}
                      onChange={(e) => updateExperience(idx, { ...exp, position: e.target.value })}
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeExperience(idx)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h1 className="text-3xl font-black mb-2">{previewName}</h1>
            <p className="text-sm text-gray-500 mb-4">{previewContact}</p>
            {currentResume.summary && (
              <>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-2">Summary</h3>
                <p className="text-sm whitespace-pre-wrap mb-4">{currentResume.summary}</p>
              </>
            )}
            {currentResume.experience.length > 0 && (
              <>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-2">Experience</h3>
                <div className="space-y-2">
                  {currentResume.experience.map((exp, idx) => (
                    <div key={exp.id || idx}>
                      <p className="font-semibold">{exp.position || 'Position'}· {exp.company || 'Company'}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
