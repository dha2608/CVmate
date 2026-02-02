import { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, Sparkles, CheckCircle2, Keyboard } from 'lucide-react';
import ExportShare from '@/components/ExportShare';
import PersonalForm from '@/components/builder/PersonalForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import EducationForm from '@/components/builder/EducationForm';
import SkillsForm from '@/components/builder/SkillsForm';
import ResumePreview from '@/components/builder/ResumePreview';
import TemplateSelector from '@/components/builder/TemplateSelector';
import SectionReorder from '@/components/builder/SectionReorder';
import AISuggestions from '@/components/builder/AISuggestions';
import ShortcutsModal from '@/components/builder/ShortcutsModal';
import AIFeatureNotice from '@/components/AIFeatureNotice';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import { api } from '@/lib/utils';

const Builder = () => {
  const { currentResume, updateField, aiEnhanceText, setResume } = useResumeStore();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern-red');
  const [sections, setSections] = useState([
    { id: 'personal', label: 'Personal Info', visible: true },
    { id: 'summary', label: 'Summary', visible: true },
    { id: 'experience', label: 'Experience', visible: true },
    { id: 'education', label: 'Education', visible: true },
    { id: 'skills', label: 'Skills', visible: true },
  ]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!currentResume.personalInfo.fullName || !currentResume.personalInfo.email) {
      alert('Please fill in at least your name and email');
      return;
    }

    setSaving(true);
    try {
      const resumeData = {
        title: currentResume.title || 'My Resume',
        personalInfo: currentResume.personalInfo,
        summary: currentResume.summary,
        experience: currentResume.experience,
        education: currentResume.education,
        skills: currentResume.skills,
      };

      let response;
      if (currentResume._id) {
        response = await api.updateResume(currentResume._id, resumeData);
      } else {
        response = await api.createResume(resumeData);
        if (response.success && response.data._id) {
          setResume({ ...currentResume, _id: response.data._id });
        }
      }

      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error: any) {
      alert('Failed to save: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Dynamic import để giảm bundle size
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const element = document.getElementById('resume-preview');
      if (!element) {
        alert('Resume preview not found');
        return;
      }

      // Capture element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${currentResume.personalInfo.fullName || 'resume'}-CV.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback to print method
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const content = document.getElementById('resume-preview')?.innerHTML || '';
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Resume - ${currentResume.personalInfo.fullName || 'CV'}</title>
              <style>
                @media print {
                  @page { margin: 0; size: A4; }
                  body { margin: 0; }
                }
                body { font-family: 'Inter', sans-serif; }
                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              </style>
            </head>
            <body>${content}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  };

  const handleAIEnhanceSummary = async () => {
    if (!currentResume.summary.trim()) {
      alert('Please enter some text to enhance');
      return;
    }

    setEnhancing(true);
    setAiError(null);
    try {
      const enhanced = await aiEnhanceText(currentResume.summary, 'summary');
      updateField('summary', enhanced);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to enhance text. Please try again.';
      setAiError(errorMessage);
      if (!errorMessage.includes('OpenAI API key') && !errorMessage.includes('not configured')) {
        alert(errorMessage);
      }
    } finally {
      setEnhancing(false);
    }
  };

  // Keyboard shortcuts - must be after function definitions
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      action: () => {
        if (!currentResume || !currentResume.personalInfo || !currentResume.personalInfo.fullName || !currentResume.personalInfo.email) {
          return;
        }
        handleSave();
      },
      description: 'Save resume'
    },
    {
      key: 'd',
      ctrl: true,
      action: handleDownload,
      description: 'Download PDF'
    },
    {
      key: '?',
      action: () => setShowShortcuts(!showShortcuts),
      description: 'Show shortcuts'
    },
  ]);

  const tabs = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Editor Side */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="p-4 border-b-2 border-gray-200 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')} 
              className="rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-black text-jet-black">CV Builder</h2>
              <p className="text-xs text-gray-500">Create your perfect resume</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TemplateSelector 
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
            <SectionReorder
              sections={sections}
              onReorder={setSections}
              onToggleVisibility={(id) => {
                setSections(sections.map(s => 
                  s.id === id ? { ...s, visible: !s.visible } : s
                ));
              }}
            />
            <AISuggestions />
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="rounded-lg hover:bg-gray-100"
              title="Keyboard Shortcuts"
            >
              <Keyboard size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              disabled={saving}
              className="border-2 border-gray-200 hover:border-crimson-red hover:text-crimson-red"
            >
              {saved ? (
                <>
                  <CheckCircle2 size={16} className="mr-1 text-green-500" />
                  Saved
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              onClick={handleDownload}
              className="bg-crimson-red hover:bg-fire-red text-white"
            >
              <Download size={16} className="mr-1" />
              PDF
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 overflow-x-auto">
          {tabs
            .filter(tab => {
              const section = sections.find(s => s.id === tab.id);
              return section?.visible !== false;
            })
            .map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-crimson-red text-crimson-red bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {activeTab === 'personal' && <PersonalForm />}
            
            {activeTab === 'summary' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {aiError && (aiError.includes('OpenAI API key') || aiError.includes('not configured')) && (
                  <AIFeatureNotice 
                    feature="AI CV Enhancement" 
                    onDismiss={() => setAiError(null)}
                  />
                )}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-jet-black dark:text-white">Professional Summary</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAIEnhanceSummary}
                    disabled={enhancing || !currentResume.summary.trim()}
                    className="border-crimson-red text-crimson-red hover:bg-crimson-red hover:text-white"
                  >
                    <Sparkles size={14} className="mr-1" />
                    {enhancing ? 'Enhancing...' : 'AI Enhance'}
                  </Button>
                </div>
                <Textarea
                  className="w-full min-h-[200px] p-4 border-2 border-gray-200 focus:border-crimson-red rounded-lg text-sm"
                  value={currentResume.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  placeholder="Write a compelling summary of your professional background, key achievements, and career goals. This will be enhanced by AI to make it more impactful..."
                />
                <p className="text-xs text-gray-500">
                  💡 Tip: Write bullet points or simple sentences. AI will transform them into professional language.
                </p>
              </div>
            )}
            
            {activeTab === 'experience' && <ExperienceForm />}
            {activeTab === 'education' && <EducationForm />}
            {activeTab === 'skills' && <SkillsForm />}
          </div>
        </div>
      </div>

      {/* Preview Side */}
      <div className="w-1/2 bg-light-grey p-8 overflow-y-auto flex justify-center">
        <ResumePreview template={selectedTemplate} />
      </div>

      {/* Shortcuts Modal */}
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
};

export default Builder;
