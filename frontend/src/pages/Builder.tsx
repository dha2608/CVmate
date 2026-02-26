import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useResumeStore } from '@/store/resumeStore';
import BuilderSidebar, { type BuilderSection, type BuilderSectionId } from '@/components/builder/BuilderSidebar';
import ResumePreview from '@/components/builder/ResumePreview';
import BuilderActionsDialog from '@/components/builder/BuilderActionsDialog';
import ShortcutsModal from '@/components/builder/ShortcutsModal';
import PersonalForm from '@/components/builder/PersonalForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import EducationForm from '@/components/builder/EducationForm';
import SkillsForm from '@/components/builder/SkillsForm';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Menu, Eye, Edit3, Brain } from 'lucide-react';
import { api } from '@/lib/utils';
import { useToastStore } from '@/store/toastStore';

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
    <div className="space-y-4" data-section="summary">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Professional Summary</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAiEnhance}
          disabled={enhancing}
          className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/30"
        >
          <Brain size={16} />
          {enhancing ? 'Enhancing…' : 'AI Enhance'}
        </Button>
      </div>
      <Textarea
        placeholder="Write a brief summary of your experience and goals..."
        value={summary}
        onChange={(e) => onSummaryChange(e.target.value)}
        className="min-h-[160px] resize-y"
      />
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

  const handleSave = useCallback(async () => {
    setSaving(true);
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

      toast.success('Lưu CV thành công');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error: any) {
      toast.error(error?.message || 'Không thể lưu CV. Vui lòng thử lại.');
    } finally {
      setSaving(false);
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

  const handleDownload = useCallback(() => {
    toast.success('Đang mở hộp thoại in. Hãy chọn "Save as PDF" để tải CV.');
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
          toast.error(error?.message || 'Không thể tải CV đã lưu.');
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
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-2 sm:px-4 lg:px-0">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] min-h-[600px] bg-gray-50 dark:bg-gray-950 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative">
          {/* Mobile: overlay sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          <div
            className={`fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto w-[280px] lg:w-[300px] transform transition-transform duration-300 ease-out shadow-xl lg:shadow-none ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
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
              onSave={handleSave}
              onDownload={handleDownload}
              isCollapsed={sidebarOpen ? false : isCollapsed}
              onToggleCollapsed={() => setIsCollapsed((c) => !c)}
              onOpenActions={() => setActionsOpen(true)}
              onBack={() => navigate('/dashboard')}
              currentResume={currentResume}
            />
          </div>

          {/* Main: form + preview */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Mobile: toggle Edit / Preview */}
            <div className="flex lg:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <button
              type="button"
              onClick={() => setMobileView('form')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
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
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
                mobileView === 'preview'
                  ? 'text-crimson-red border-b-2 border-crimson-red bg-red-50/50 dark:bg-red-900/20'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Eye size={18} />
              Preview
            </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
              <div
                className={`w-full lg:w-5/12 border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-gray-900 ${
                  mobileView !== 'form' ? 'hidden lg:block' : ''
                }`}
              >
                <div className="lg:hidden flex items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="gap-2"
                  >
                    <Menu size={18} />
                    Sections
                  </Button>
                </div>
                <div className="max-w-xl mx-auto">
                  {loadingResume ? (
                    <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Đang tải CV...</div>
                  ) : (
                    renderFormPanel()
                  )}
                </div>
              </div>

              <div
                className={`w-full lg:w-7/12 overflow-y-auto p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 flex items-start justify-center ${
                  mobileView !== 'preview' ? 'hidden lg:flex' : ''
                }`}
              >
                <div className="w-full max-w-[210mm] shadow-lg bg-white print:shadow-none">
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
      />

      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </MainLayout>
  );
};

export default memo(Builder);
