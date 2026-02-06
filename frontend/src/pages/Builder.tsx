import { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, Brain, CheckCircle2, Keyboard, ListTree, Settings2, X, Lightbulb } from 'lucide-react';
import ExportShare from '@/components/ExportShare';
import PersonalForm from '@/components/builder/PersonalForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import EducationForm from '@/components/builder/EducationForm';
import SkillsForm from '@/components/builder/SkillsForm';
import ResumePreview from '@/components/builder/ResumePreview';
import TemplateSelector from '@/components/builder/TemplateSelector';
import SectionReorder from '@/components/builder/SectionReorder';
import BuilderSidebar, { type BuilderSection, type BuilderSectionId } from '@/components/builder/BuilderSidebar';
import BuilderActionsDialog from '@/components/builder/BuilderActionsDialog';
import AISuggestions from '@/components/builder/AISuggestions';
import ShortcutsModal from '@/components/builder/ShortcutsModal';
import AIFeatureNotice from '@/components/AIFeatureNotice';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import { api } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

const Builder = () => {
  const { currentResume, resumes, updateField, aiEnhanceText, setResume, setResumes } = useResumeStore();
  const [activeTab, setActiveTab] = useState<BuilderSectionId>('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern-red');
  const [sections, setSections] = useState<BuilderSection[]>([
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
  const [dismissedHints, setDismissedHints] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSave = async (retryCount = 0) => {
    // Frontend validation before submit
    const { validatePersonalInfo } = await import('@/utils/validation');
    const personalInfoValidation = validatePersonalInfo({
      fullName: currentResume.personalInfo.fullName || '',
      email: currentResume.personalInfo.email || '',
      phone: currentResume.personalInfo.phone,
      address: currentResume.personalInfo.address,
      linkedin: currentResume.personalInfo.linkedin,
      website: currentResume.personalInfo.website,
    });

    if (!personalInfoValidation.valid) {
      const { useToastStore } = await import('@/store/toastStore');
      useToastStore.getState().error(
        `Please fix the following errors:\n${personalInfoValidation.errors.map(e => `- ${e}`).join('\n')}`
      );
      return;
    }

    if (!currentResume.personalInfo.fullName || !currentResume.personalInfo.email) {
      const { useToastStore } = await import('@/store/toastStore');
      useToastStore.getState().error('Please fill in at least your name and email');
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
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().error(
          `Experience #${missingExp + 1} is missing required fields (Company and Position). Please complete or delete it before saving.`
        );
        setSaving(false);
        return;
      }

      const missingEdu = cleanedEducation.findIndex((e) => !e.institution || !e.degree);
      if (missingEdu >= 0) {
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().error(
          `Education #${missingEdu + 1} is missing required fields (Institution and Degree). Please complete or delete it before saving.`
        );
        setSaving(false);
        return;
      }

      // Prepare payload with proper structure
      const resumeData = {
        title: (currentResume.title || 'My Resume').trim(),
        personalInfo: {
          fullName: (currentResume.personalInfo.fullName || '').trim(),
          email: (currentResume.personalInfo.email || '').trim(),
          phone: (currentResume.personalInfo.phone || '').trim(),
          address: (currentResume.personalInfo.address || '').trim(),
          linkedin: (currentResume.personalInfo.linkedin || '').trim(),
          website: (currentResume.personalInfo.website || '').trim(),
        },
        summary: (currentResume.summary || '').trim(),
        experience: cleanedExperience,
        education: cleanedEducation,
        skills: (currentResume.skills || []).map((s) => String(s).trim()).filter(Boolean),
      };

      // Log payload in development for debugging
      if (import.meta.env.DEV) {
        console.log('📤 Saving resume payload:', JSON.stringify(resumeData, null, 2));
      }

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
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().success('CV saved successfully!');
        trackEvent('cv_saved', {
          hasId: !!currentResume._id,
          hasSummary: !!currentResume.summary?.trim(),
          experienceCount: currentResume.experience.length,
          educationCount: currentResume.education.length,
          skillsCount: currentResume.skills.length,
        });
      }
    } catch (error: any) {
      // Enhanced error handling with detailed logging
      let errorMessage = 'Failed to save resume';
      const errors: string[] = [];
      
      // Log error details for debugging
      console.error('❌ Save CV Error:', {
        error,
        status: error?.status,
        message: error?.message,
        details: error?.details,
        retryCount,
      });
      
      // Check for validation errors from API response
      if (error?.details) {
        const details = error.details;
        if (details.errors && Array.isArray(details.errors)) {
          errors.push(...details.errors.map((e: any) => {
            if (typeof e === 'string') return e;
            if (e?.message) return e.message;
            if (e?.path) return `${e.path}: ${e.message || 'Invalid'}`;
            return String(e);
          }));
        }
        if (details.message) {
          errorMessage = details.message;
        }
      }
      
      // Check for Zod validation errors
      if (error?.details?.errors && Array.isArray(error.details.errors)) {
        error.details.errors.forEach((err: any) => {
          if (err.path) {
            errors.push(`${err.path.join('.')}: ${err.message || 'Invalid'}`);
          } else {
            errors.push(err.message || 'Validation error');
          }
        });
      }
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Retry mechanism for network errors (max 2 retries)
      const isNetworkError = error?.status === 0 || error?.status >= 500 || error?.message?.includes('fetch');
      if (isNetworkError && retryCount < 2) {
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().error(`Network error. Retrying... (${retryCount + 1}/2)`);
        setSaving(false);
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return handleSave(retryCount + 1);
      }
      
      const finalMessage = errors.length 
        ? `${errorMessage}\n\nValidation errors:\n${errors.map(e => `- ${e}`).join('\n')}`
        : errorMessage;
      
      // Use toast instead of alert
      const { useToastStore } = await import('@/store/toastStore');
      useToastStore.getState().error(finalMessage);
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
      const { useToastStore } = await import('@/store/toastStore');
      useToastStore.getState().error('Please enter some text to enhance');
      return;
    }

    setEnhancing(true);
    setAiError(null);
    try {
      const enhanced = await aiEnhanceText(currentResume.summary, 'summary');
      if (enhanced && enhanced !== currentResume.summary) {
        updateField('summary', enhanced);
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().success('Summary enhanced successfully!');
        trackEvent('cv_ai_enhance', {
          field: 'summary',
          originalLength: currentResume.summary.length,
          enhancedLength: enhanced.length,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enhance text. Please try again.';
      
      // Check if it's a configuration error
      const isConfigError = errorMessage.toLowerCase().includes('unavailable') || 
                           errorMessage.toLowerCase().includes('api key') || 
                           errorMessage.toLowerCase().includes('not configured');
      
      if (isConfigError) {
        // Show notice banner for config errors
        setAiError(errorMessage);
      } else {
        // Use toast for other errors
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().error(errorMessage);
      }
    } finally {
      setEnhancing(false);
    }
  };

  const handleAIGenerateFull = async () => {
    if (!generatePrompt.trim() && !generateJD.trim()) {
      const { useToastStore } = await import('@/store/toastStore');
      useToastStore.getState().error('Please provide at least a short prompt or job description for AI to work with.');
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
          ...exp,
          id: exp.id || `exp-${Date.now()}-${idx}`,
        })) || currentResume.experience,
        education: data.education?.map((edu, idx) => ({
          ...edu,
          id: edu.id || `edu-${Date.now()}-${idx}`,
        })) || currentResume.education,
        skills: Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : currentResume.skills,
      });

      const { useToastStore } = await import('@/store/toastStore');
      useToastStore.getState().success('CV generated successfully!');

      trackEvent('cv_ai_enhance', {
        field: 'full_resume',
        hasJD: !!generateJD.trim(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate resume. Please try again.';
      
      // Check if it's a configuration error (API key missing)
      const isConfigError = errorMessage.toLowerCase().includes('unavailable') || 
                           errorMessage.toLowerCase().includes('api key') || 
                           errorMessage.toLowerCase().includes('not configured');
      
      if (isConfigError) {
        // Show notice banner instead of toast for config errors
        setAiError(errorMessage);
      } else {
        // Use toast for other errors
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().error(errorMessage);
      }
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
        sections={sections}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode="power"
        saved={saved}
        saving={saving}
        onSave={handleSave}
        onDownload={handleDownload}
        isCollapsed={false}
        onToggleCollapsed={() => {}}
        onOpenActions={() => setShowActions(true)}
        onBack={() => navigate('/dashboard')}
        currentResume={currentResume}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50">
        {/* Editor Side */}
        <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col border-r border-gray-200 bg-white shadow-sm">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50/50 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-jet-black">
                    {sections.find(s => s.id === activeTab)?.label || 'CV Builder'}
                  </h2>
                </div>
                <p className="text-xs text-gray-500">
                  {activeTab === 'personal' && 'Add your contact information and basic details'}
                  {activeTab === 'summary' && 'Write a compelling professional summary (AI can help enhance it)'}
                  {activeTab === 'experience' && 'Add your work history and professional experience'}
                  {activeTab === 'education' && 'Include your academic background and qualifications'}
                  {activeTab === 'skills' && 'List your technical and soft skills'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(true)}
                className="text-gray-500 hover:text-gray-700"
                title="Keyboard shortcuts (?)"
              >
                <Keyboard size={16} className="mr-1.5" />
                <span className="text-xs">?</span>
              </Button>
            </div>
          </div>
        
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Onboarding Hint */}
            {!dismissedHints.includes('welcome') && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 relative">
                <button
                  onClick={() => setDismissedHints([...dismissedHints, 'welcome'])}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Welcome to CV Builder!</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Start by filling in your <strong>Personal Information</strong> on the left. 
                      Your changes will appear instantly in the <strong>Live Preview</strong> on the right. 
                      Use the sidebar to navigate between sections, and don't forget to <strong>Save</strong> your work!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Forms */}
            {activeTab === 'personal' && <PersonalForm />}

            {activeTab === 'summary' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {aiError && (aiError.toLowerCase().includes('api key') || aiError.toLowerCase().includes('not configured')) && (
                  <AIFeatureNotice 
                    feature="AI CV Enhancement" 
                    onDismiss={() => setAiError(null)}
                  />
                )}
                
                {/* Section Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-bold text-jet-black">Professional Summary</h3>
                      <p className="text-xs text-gray-500 mt-1">A brief overview of your professional background</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAIEnhanceSummary}
                      disabled={enhancing || !currentResume.summary.trim()}
                      className="border-crimson-red text-crimson-red hover:bg-crimson-red hover:text-white shadow-sm"
                    >
                      <Brain size={14} className="mr-1.5" />
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
                  {aiError && (aiError.toLowerCase().includes('unavailable') || aiError.toLowerCase().includes('api key') || aiError.toLowerCase().includes('not configured')) && !dismissedHints.includes('ai-unavailable') && (
                    <AIFeatureNotice 
                      feature="AI CV Builder" 
                      onDismiss={() => {
                        setDismissedHints([...dismissedHints, 'ai-unavailable']);
                        setAiError(null);
                      }}
                    />
                  )}
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
