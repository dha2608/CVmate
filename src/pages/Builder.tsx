import { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, Brain, CheckCircle2, Keyboard, ListTree, Settings2 } from 'lucide-react';
import ExportShare from '@/components/ExportShare';
import PersonalForm from '@/components/builder/PersonalForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import EducationForm from '@/components/builder/EducationForm';
import SkillsForm from '@/components/builder/SkillsForm';
import ResumePreview from '@/components/builder/ResumePreview';
import TemplateSelector from '@/components/builder/TemplateSelector';
import SectionReorder from '@/components/builder/SectionReorder';
import BuilderSidebar from '@/components/builder/BuilderSidebar';
import BuilderActionsDialog from '@/components/builder/BuilderActionsDialog';
import AISuggestions from '@/components/builder/AISuggestions';
import ShortcutsModal from '@/components/builder/ShortcutsModal';
import AIFeatureNotice from '@/components/AIFeatureNotice';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import { api } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

const Builder = () => {
  const { currentResume, resumes, updateField, aiEnhanceText, setResume, setResumes } = useResumeStore();
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
  const [showActions, setShowActions] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generateJD, setGenerateJD] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!currentResume.personalInfo.fullName || !currentResume.personalInfo.email) {
      alert('Please fill in at least your name and email');
      return;
    }

    setSaving(true);
    try {
      // Filter out fully empty items and block save on partially-filled items that would fail backend validation
      const cleanedExperience = (currentResume.experience || [])
        .filter((exp) => {
          const hasAny =
            !!exp.company?.trim() ||
            !!exp.position?.trim() ||
            !!exp.startDate?.trim() ||
            !!exp.endDate?.trim() ||
            !!exp.description?.trim();
          return hasAny;
        })
        .map((exp) => ({
          ...exp,
          company: (exp.company || '').trim(),
          position: (exp.position || '').trim(),
          startDate: (exp.startDate || '').trim(),
          endDate: (exp.endDate || '').trim(),
          description: (exp.description || '').trim(),
        }));

      const cleanedEducation = (currentResume.education || [])
        .filter((edu) => {
          const hasAny =
            !!edu.institution?.trim() ||
            !!edu.degree?.trim() ||
            !!edu.startDate?.trim() ||
            !!edu.endDate?.trim() ||
            !!edu.description?.trim();
          return hasAny;
        })
        .map((edu) => ({
          ...edu,
          institution: (edu.institution || '').trim(),
          degree: (edu.degree || '').trim(),
          startDate: (edu.startDate || '').trim(),
          endDate: (edu.endDate || '').trim(),
          description: (edu.description || '').trim(),
        }));

      const missingExp = cleanedExperience.findIndex((e) => !e.company || !e.position);
      if (missingExp >= 0) {
        alert(`Experience #${missingExp + 1} is missing required fields (Company and Position). Please complete or delete it before saving.`);
        return;
      }

      const missingEdu = cleanedEducation.findIndex((e) => !e.institution || !e.degree);
      if (missingEdu >= 0) {
        alert(`Education #${missingEdu + 1} is missing required fields (Institution and Degree). Please complete or delete it before saving.`);
        return;
      }

      const resumeData = {
        title: currentResume.title || 'My Resume',
        personalInfo: currentResume.personalInfo,
        summary: currentResume.summary,
        experience: cleanedExperience,
        education: cleanedEducation,
        skills: (currentResume.skills || []).map((s) => String(s).trim()).filter(Boolean),
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
        trackEvent('cv_saved', {
          hasId: !!currentResume._id,
          hasSummary: !!currentResume.summary?.trim(),
          experienceCount: currentResume.experience.length,
          educationCount: currentResume.education.length,
          skillsCount: currentResume.skills.length,
        });
      }
    } catch (error: any) {
      const details = error?.details;
      const errors = Array.isArray(details?.errors) ? details.errors : [];
      const extra = errors.length ? `\n\nDetails:\n- ${errors.join('\n- ')}` : '';
      alert('Failed to save: ' + (error.message || 'Unknown error') + extra);
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
      trackEvent('cv_ai_enhance', {
        field: 'summary',
        originalLength: currentResume.summary.length,
        enhancedLength: enhanced.length,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to enhance text. Please try again.';
      setAiError(errorMessage);
      // Only show alert if it's not a simple configuration error
      if (!errorMessage.toLowerCase().includes('api key') && !errorMessage.toLowerCase().includes('not configured')) {
        alert(errorMessage);
      }
    } finally {
      setEnhancing(false);
    }
  };

  const handleAIGenerateFull = async () => {
    if (!generatePrompt.trim() && !generateJD.trim()) {
      alert('Please provide at least a short prompt or job description for AI to work with.');
      return;
    }

    setIsGeneratingFull(true);
    setAiError(null);
    try {
      const { aiGenerateFull } = useResumeStore.getState();
      const data = await aiGenerateFull({
        prompt: generatePrompt,
        jobDescription: generateJD,
      });

      // Map dữ liệu AI vào resume hiện tại, giữ nguyên title & personalInfo
      setResume({
        ...currentResume,
        summary: data.summary || currentResume.summary,
        experience: data.experience?.map((exp, idx) => ({
          id: exp.id || `exp-${Date.now()}-${idx}`,
          ...exp,
        })) || currentResume.experience,
        education: data.education?.map((edu, idx) => ({
          id: edu.id || `edu-${Date.now()}-${idx}`,
          ...edu,
        })) || currentResume.education,
        skills: Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : currentResume.skills,
      });

      trackEvent('cv_ai_enhance', {
        field: 'full_resume',
        hasJD: !!generateJD.trim(),
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate resume. Please try again.';
      setAiError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsGeneratingFull(false);
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

  const quickPresets = [
    {
      id: 'fresh-grad-it',
      label: 'Fresher IT',
      description: 'Sinh viên mới ra trường ngành CNTT',
      apply: () =>
        setResume({
          ...currentResume,
          title: 'Junior Frontend Developer',
          summary:
            'Fresh graduate in Computer Science with a strong foundation in JavaScript, React, and modern frontend tooling. Passionate about building clean, accessible user interfaces and eager to learn best practices in production environments.',
          skills: ['JavaScript', 'TypeScript', 'React', 'HTML/CSS', 'Git', 'REST API'],
        }),
    },
    {
      id: 'mid-fe',
      label: 'Mid Frontend',
      description: '2–4 năm kinh nghiệm Frontend',
      apply: () =>
        setResume({
          ...currentResume,
          title: 'Frontend Engineer',
          summary:
            'Frontend Engineer with 3+ years of experience building scalable web applications using React and TypeScript. Experienced in collaborating with product and design to ship user-centric features with attention to performance and DX.',
          skills: [
            'React',
            'TypeScript',
            'Next.js',
            'Node.js',
            'Tailwind CSS',
            'Unit Testing',
          ],
        }),
    },
  ];

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <BuilderSidebar
        sections={sections as any}
        activeTab={activeTab as any}
        setActiveTab={setActiveTab as any}
        mode="power"
        saved={saved}
        saving={saving}
        onSave={handleSave}
        onDownload={handleDownload}
        isCollapsed={false}
        onToggleCollapsed={() => {}}
        onOpenActions={() => setShowActions(true)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50">
        {/* Editor Side */}
        <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col border-r border-gray-200 bg-white shadow-sm">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/dashboard')} 
                  className="rounded-lg hover:bg-gray-100 h-9 w-9"
                >
                  <ArrowLeft size={18} />
                </Button>
                <div>
                  <h2 className="text-lg font-bold text-jet-black">
                    {sections.find(s => s.id === activeTab)?.label || 'CV Builder'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeTab === 'personal' && 'Your contact information and basic details'}
                    {activeTab === 'summary' && 'Professional summary and career objectives'}
                    {activeTab === 'experience' && 'Work history and professional experience'}
                    {activeTab === 'education' && 'Academic background and qualifications'}
                    {activeTab === 'skills' && 'Technical and soft skills'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Forms */}
            {activeTab === 'personal' && <PersonalForm />}

            {activeTab === 'summary' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {aiError && (aiError.toLowerCase().includes('api key') || aiError.toLowerCase().includes('not configured')) && (
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
                    <Brain size={14} className="mr-1" />
                    {enhancing ? 'Enhancing...' : 'AI Enhance'}
                  </Button>
                </div>
                  <Textarea
                    className="w-full min-h-[180px] p-4 border-2 border-gray-200 focus:border-crimson-red rounded-lg text-sm transition-colors"
                    value={currentResume.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    placeholder="Write a compelling summary of your professional background, key achievements, and career goals. This will be enhanced by AI to make it more impactful..."
                  />
                  <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Tip: Write bullet points or simple sentences. AI will transform them into professional language.</span>
                  </p>
                </div>

                {/* AI Generate Full Resume */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Brain size={16} className="text-purple-600" />
                        AI CV Builder Pro (Beta)
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Generate your entire CV with AI assistance
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isGeneratingFull}
                      onClick={handleAIGenerateFull}
                      className="border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 shadow-sm"
                    >
                      {isGeneratingFull ? (
                        <>
                          <Brain size={14} className="mr-1.5 animate-pulse" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain size={14} className="mr-1.5" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Mô tả nhanh về kinh nghiệm, mục tiêu nghề nghiệp và (tuỳ chọn) dán Job Description. AI sẽ gợi ý
                    Summary, Experience, Education và Skills phù hợp.
                  </p>
                  <Textarea
                    className="w-full min-h-[80px] p-3 border border-gray-200 focus:border-crimson-red rounded-lg text-xs"
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    placeholder="Ví dụ: 3 năm kinh nghiệm Frontend (React), từng làm ở startup, muốn apply vị trí Frontend Engineer cho sản phẩm B2C..."
                  />
                  <Textarea
                    className="w-full min-h-[80px] p-3 border border-gray-200 focus:border-crimson-red rounded-lg text-xs"
                    value={generateJD}
                    onChange={(e) => setGenerateJD(e.target.value)}
                    placeholder="(Tuỳ chọn) Dán mô tả công việc mà bạn muốn apply để AI align CV sát với JD..."
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'experience' && <ExperienceForm />}
            {activeTab === 'education' && <EducationForm />}
            {activeTab === 'skills' && <SkillsForm />}
          </div>
        </div>
        </div>

      {/* Preview Side */}
      <div className="w-full lg:w-[55%] xl:w-[58%] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex flex-col">
        {/* Preview Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Live Preview</h3>
            <p className="text-xs text-gray-500 mt-0.5">Real-time CV preview</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings2 size={16} className="mr-1.5" />
              <span className="text-xs">Template</span>
            </Button>
          </div>
        </div>
        
        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="w-full max-w-[210mm] mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
            <ResumePreview template={selectedTemplate} sections={sections} />
          </div>
        </div>
      </div>
      </div>

      {/* Dialogs */}
      <BuilderActionsDialog
        open={showActions}
        onOpenChange={setShowActions}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        sections={sections}
        onReorderSections={setSections}
        onToggleSectionVisibility={(id) => {
          setSections((prev) =>
            prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
          );
        }}
        onOpenShortcuts={() => setShowShortcuts(true)}
        quickPresets={quickPresets}
      />
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
};

export default Builder;
