import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useResumeStore } from '@/store/resumeStore';
import BuilderSidebar, { type BuilderSection, type BuilderSectionId } from '@/components/builder/BuilderSidebar';
import ResumePreview from '@/components/builder/ResumePreview';
import BuilderActionsDialog, { type AtsAnalysisResult } from '@/components/builder/BuilderActionsDialog';
import ShortcutsModal from '@/components/builder/ShortcutsModal';
import PersonalForm from '@/components/builder/PersonalForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import EducationForm from '@/components/builder/EducationForm';
import SkillsForm from '@/components/builder/SkillsForm';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Menu, Eye, Edit3, Brain, Save, Download, Settings2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/utils';
import { useToastStore } from '@/store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';

const SummaryPanel = memo(({ summary, onSummaryChange }: { summary: string; onSummaryChange: (v: string) => void }) => {
  const [enhancing, setEnhancing] = useState(false);
  const handleAiEnhance = useCallback(async () => {
    const text = summary?.trim() || 'Experienced professional seeking new opportunities.';
    setEnhancing(true);
    try {
      const enhanced = await useResumeStore.getState().aiEnhanceText(text, 'summary');
      if (enhanced) onSummaryChange(enhanced);
    } catch (e) {
      const { useToastStore } = await import('@/store/toastStore');
      useToastStore.getState().error((e as Error)?.message || 'Enhance failed');
    } finally {
      setEnhancing(false);
    }
  }, [summary, onSummaryChange]);
  return (
    <div className="space-y-6 animate-in fade-in duration-300" data-section="summary">
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Professional Summary</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Write a compelling summary that highlights your key strengths and career goals
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAiEnhance}
            disabled={enhancing}
            className="gap-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
          >
            <Brain size={16} className={enhancing ? 'animate-spin' : ''} />
            {enhancing ? 'Enhancing…' : 'AI Enhance'}
          </Button>
        </div>
        <Textarea
          placeholder="Example: Experienced software engineer with 5+ years of expertise in full-stack development. Proven track record of delivering scalable web applications using React, Node.js, and cloud technologies. Passionate about clean code, agile methodologies, and mentoring junior developers..."
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          className="min-h-[180px] resize-y text-sm"
        />
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{summary.length} characters</span>
          <span className={summary.length > 500 ? 'text-amber-600' : ''}>
            Recommended: 100-500 characters
          </span>
        </div>
      </div>
    </div>
  );
});
SummaryPanel.displayName = 'SummaryPanel';

const INITIAL_SECTIONS: BuilderSection[] = [
  { id: 'personal', label: 'Personal Info', visible: true },
  { id: 'summary', label: 'Summary', visible: true },
  { id: 'experience', label: 'Experience', visible: true },
  { id: 'education', label: 'Education', visible: true },
  { id: 'skills', label: 'Skills', visible: true },
];

const Builder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToastStore();
  const currentResume = useResumeStore((s) => s.currentResume);
  const setResume = useResumeStore((s) => s.setResume);

  const [sections, setSections] = useState<BuilderSection[]>(() => INITIAL_SECTIONS);
  const [activeTab, setActiveTab] = useState<BuilderSectionId>('personal');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-red');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [loadingResume, setLoadingResume] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<AtsAnalysisResult | null>(null);
  const [atsAnalyzing, setAtsAnalyzing] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const resumeId = searchParams.get('id');

  const normalizeResumeForStore = useCallback((resumeData: any) => {
    const safeExperience = Array.isArray(resumeData?.experience) ? resumeData.experience : [];
    const safeEducation = Array.isArray(resumeData?.education) ? resumeData.education : [];

    return {
      ...resumeData,
      personalInfo: {
        fullName: resumeData?.personalInfo?.fullName || '',
        email: resumeData?.personalInfo?.email || '',
        phone: resumeData?.personalInfo?.phone || '',
        address: resumeData?.personalInfo?.address || '',
        linkedin: resumeData?.personalInfo?.linkedin || '',
        website: resumeData?.personalInfo?.website || '',
      },
      summary: resumeData?.summary || '',
      skills: Array.isArray(resumeData?.skills) ? resumeData.skills : [],
      experience: safeExperience.map((exp: any, index: number) => ({
        id: exp?.id || exp?._id || `exp-${Date.now()}-${index}`,
        company: exp?.company || '',
        position: exp?.position || '',
        startDate: exp?.startDate || '',
        endDate: exp?.endDate || '',
        description: exp?.description || '',
      })),
      education: safeEducation.map((edu: any, index: number) => ({
        id: edu?.id || edu?._id || `edu-${Date.now()}-${index}`,
        institution: edu?.institution || '',
        degree: edu?.degree || '',
        startDate: edu?.startDate || '',
        endDate: edu?.endDate || '',
        description: edu?.description || '',
      })),
    };
  }, []);

  const handleSave = useCallback(async (silent = false) => {
    if (!silent) {
      setSaving(true);
    }
    try {
      const payload = {
        title: currentResume.title || 'Untitled Resume',
        personalInfo: currentResume.personalInfo,
        summary: currentResume.summary,
        experience: currentResume.experience,
        education: currentResume.education,
        skills: currentResume.skills,
      };

      const response = resumeId
        ? await api.updateResume(resumeId, payload)
        : await api.createResume(payload);

      if (!response.success || !response.data) {
        throw new Error('Failed to save resume');
      }

      const normalized = normalizeResumeForStore(response.data);
      setResume(normalized);

      if (!resumeId && response.data._id) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('id', response.data._id);
        setSearchParams(nextParams, { replace: true });
      }

      if (!silent) {
        toast.success('CV saved successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error: any) {
      if (!silent) {
        toast.error(error?.message || 'Failed to save CV. Please try again.');
      }
    } finally {
      if (!silent) {
        setSaving(false);
      }
    }
  }, [
    currentResume,
    normalizeResumeForStore,
    resumeId,
    searchParams,
    setResume,
    setSearchParams,
    toast,
  ]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      if (resumeId && currentResume.personalInfo?.fullName && currentResume.personalInfo?.email) {
        handleSave(true); // Silent auto-save
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    setAutoSaveTimer(timer);

    return () => {
      clearTimeout(timer);
    };
  }, [currentResume, resumeId, handleSave]);

  const handleDownload = useCallback(() => {
    toast.success('Opening print dialog. Select "Save as PDF" to download your CV.');
    window.print();
  }, [toast]);

  const handleReorderSections = useCallback((newSections: BuilderSection[]) => {
    setSections(newSections);
  }, []);

  const handleToggleSectionVisibility = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  }, []);

  const handleOpenShortcuts = useCallback(() => {
    setActionsOpen(false);
    setShortcutsOpen(true);
  }, []);

  const quickPresets = useMemo(
    () => [
      {
        id: 'sample',
        label: 'Sample data',
        description: 'Pre-fill with example',
        apply: () => {
          const store = useResumeStore.getState();
          store.updatePersonalInfo('fullName', 'Nguyen Van A');
          store.updatePersonalInfo('email', 'nguyenvana@example.com');
          store.updatePersonalInfo('phone', '+84 123 456 789');
          store.updateField('summary', 'Experienced developer with 5+ years in web technologies.');
          if (store.currentResume.experience.length === 0) {
            store.addExperience({
              id: `exp-${Date.now()}`,
              company: 'Tech Corp',
              position: 'Senior Developer',
              startDate: '2020',
              endDate: 'Present',
              description: 'Lead frontend development.',
            });
          }
        },
      },
      {
        id: 'fresh-graduate',
        label: 'Fresh Graduate',
        description: 'Starter profile for students/new grads',
        apply: () => {
          const store = useResumeStore.getState();
          store.updatePersonalInfo('fullName', 'Tran Thi B');
          store.updatePersonalInfo('email', 'tranthib@example.com');
          store.updatePersonalInfo('phone', '+84 987 654 321');
          store.updateField('summary', 'Recent graduate eager to apply strong problem-solving, communication, and technical skills in a growth-oriented environment.');
          if (store.currentResume.education.length === 0) {
            store.addEducation({
              id: `edu-${Date.now()}`,
              institution: 'University of Technology',
              degree: 'Bachelor of Information Technology',
              startDate: '2020-09',
              endDate: '2024-06',
              description: 'GPA: 3.6/4.0. Participated in software engineering capstone project.',
            });
          }
          if (store.currentResume.skills.length === 0) {
            store.setSkills(['JavaScript', 'React', 'Node.js', 'SQL', 'Git']);
          }
        },
      },
    ],
    []
  );

  const handleAiGenerate = useCallback(async (payload: { prompt?: string; jobDescription?: string; role?: string; mode?: string }) => {
    const store = useResumeStore.getState();
    const data = await store.aiGenerateFull({
      prompt: payload.prompt || payload.jobDescription,
      role: (payload.role as any) || 'fullstack',
      mode: (payload.mode as 'concise' | 'human') || 'human',
    });
    if (!data) return;
    const current = store.currentResume;
    store.setResume({
      ...current,
      summary: data.summary || current.summary,
      experience: (data.experience ?? []).map((exp, i) => ({ ...exp, id: exp.id || `exp-${Date.now()}-${i}` })),
      education: (data.education ?? []).map((edu, i) => ({ ...edu, id: edu.id || `edu-${Date.now()}-${i}` })),
      skills: data.skills?.length ? data.skills : current.skills,
    });
    const { useToastStore } = await import('@/store/toastStore');
    useToastStore.getState().success('CV generated. Review and edit as needed.');
  }, []);

  const handleAtsAnalyze = useCallback(async (jobDescription: string) => {
    if (!resumeId) {
      toast.error('Please save your CV first before running ATS Checker.');
      return;
    }

    setAtsAnalyzing(true);
    try {
      const response = await api.analyzeResume(resumeId, jobDescription);
      if (!response.success) {
        throw new Error('Failed to analyze ATS');
      }

      setAtsAnalysis(response.data || null);
      toast.success('ATS analysis completed.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to analyze ATS.');
    } finally {
      setAtsAnalyzing(false);
    }
  }, [resumeId, toast]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsOpen((open) => !open);
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleDownload();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave, handleDownload]);

  useEffect(() => {
    if (!resumeId) {
      return;
    }

    let active = true;

    const loadResume = async () => {
      setLoadingResume(true);
      try {
        const response = await api.getResume(resumeId);
        if (!active) {
          return;
        }

        if (response.success && response.data) {
          setResume(normalizeResumeForStore(response.data));
        }
      } catch (error: any) {
        if (active) {
          toast.error(error?.message || 'Failed to load saved CV.');
        }
      } finally {
        if (active) {
          setLoadingResume(false);
        }
      }
    };

    loadResume();

    return () => {
      active = false;
    };
  }, [resumeId, normalizeResumeForStore, setResume, toast]);

  const renderFormPanel = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalForm />;
      case 'summary':
        return (
          <SummaryPanel
            summary={currentResume.summary}
            onSummaryChange={(v) => useResumeStore.getState().updateField('summary', v)}
          />
        );
      case 'experience':
        return <ExperienceForm />;
      case 'education':
        return <EducationForm />;
      case 'skills':
        return <SkillsForm />;
      default:
        return null;
    }
  };

  return (
    <MainLayout layoutMode="full-width" showLeftSidebar={false} showRightSidebar={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-[1920px] mx-auto">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden"
                  >
                    <Menu size={20} />
                  </Button>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">CV Builder</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {resumeId ? 'Editing resume' : 'Create your professional resume'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {saved && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
                      >
                        <CheckCircle2 size={16} />
                        <span>Saved</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionsOpen(true)}
                    className="hidden sm:flex gap-2"
                  >
                    <Settings2 size={16} />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save size={16} className={saving ? 'animate-spin' : ''} />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-crimson-red to-fire-red hover:from-fire-red hover:to-crimson-red text-white gap-2"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Download PDF</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <AnimatePresence>
              {(sidebarOpen || window.innerWidth >= 1024) && (
                <motion.aside
                  initial={window.innerWidth < 1024 ? { x: -300 } : false}
                  animate={{ x: 0 }}
                  exit={window.innerWidth < 1024 ? { x: -300 } : false}
                  className={`fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto w-[280px] lg:w-[300px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${
                    sidebarOpen ? 'block' : 'hidden lg:block'
                  }`}
                >
                  {sidebarOpen && window.innerWidth < 1024 && (
                    <div
                      className="fixed inset-0 bg-black/50 z-[-1] lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                  )}
                  <BuilderSidebar
                    sections={sections}
                    activeTab={activeTab}
                    setActiveTab={(id) => {
                      setActiveTab(id);
                      setSidebarOpen(false);
                    }}
                    mode="guided"
                    saved={saved}
                    saving={saving}
                    onSave={() => handleSave()}
                    onDownload={handleDownload}
                    isCollapsed={isCollapsed}
                    onToggleCollapsed={() => setIsCollapsed((c) => !c)}
                    onOpenActions={() => setActionsOpen(true)}
                    onBack={() => navigate('/dashboard')}
                    currentResume={currentResume}
                  />
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Mobile Toggle */}
              <div className="flex lg:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => setMobileView('form')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                    mobileView === 'form'
                      ? 'text-crimson-red border-b-2 border-crimson-red bg-red-50/50 dark:bg-red-900/20'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Edit3 size={18} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setMobileView('preview')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                    mobileView === 'preview'
                      ? 'text-crimson-red border-b-2 border-crimson-red bg-red-50/50 dark:bg-red-900/20'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Eye size={18} />
                  Preview
                </button>
              </div>

              {/* Form Panel */}
              <div
                className={`w-full lg:w-2/5 xl:w-5/12 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto ${
                  mobileView !== 'form' ? 'hidden lg:block' : ''
                }`}
              >
                <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                  {loadingResume ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-crimson-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading CV...</p>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderFormPanel()}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Preview Panel */}
              <div
                className={`w-full lg:w-3/5 xl:w-7/12 overflow-y-auto bg-gray-100 dark:bg-gray-950 flex items-start justify-center p-4 sm:p-6 lg:p-8 ${
                  mobileView !== 'preview' ? 'hidden lg:flex' : ''
                }`}
              >
                <div className="w-full max-w-[210mm] shadow-2xl bg-white print:shadow-none rounded-lg overflow-hidden">
                  <ResumePreview template={selectedTemplate} sections={sections} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BuilderActionsDialog
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        sections={sections}
        onReorderSections={handleReorderSections}
        onToggleSectionVisibility={handleToggleSectionVisibility}
        onOpenShortcuts={handleOpenShortcuts}
        quickPresets={quickPresets}
        onAiGenerate={handleAiGenerate}
        onAtsAnalyze={handleAtsAnalyze}
        atsAnalysis={atsAnalysis}
        atsAnalyzing={atsAnalyzing}
      />

      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </MainLayout>
  );
};

export default memo(Builder);
