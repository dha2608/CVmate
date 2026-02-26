import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const INITIAL_SECTIONS: BuilderSection[] = [
  { id: 'personal', label: 'Personal Info', visible: true },
  { id: 'summary', label: 'Summary', visible: true },
  { id: 'experience', label: 'Experience', visible: true },
  { id: 'education', label: 'Education', visible: true },
  { id: 'skills', label: 'Skills', visible: true },
];

const Builder = () => {
  const navigate = useNavigate();
  const currentResume = useResumeStore((s) => s.currentResume);

  const [sections, setSections] = useState<BuilderSection[]>(() => INITIAL_SECTIONS);
  const [activeTab, setActiveTab] = useState<BuilderSectionId>('personal');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-red');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    window.print();
  }, []);

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

  const renderFormPanel = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalForm />;
      case 'summary':
        return (
          <div className="space-y-4" data-section="summary">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Professional Summary</h2>
            <Textarea
              placeholder="Write a brief summary of your experience and goals..."
              value={currentResume.summary}
              onChange={(e) => useResumeStore.getState().updateField('summary', e.target.value)}
              className="min-h-[160px] resize-y"
            />
          </div>
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
    <MainLayout layoutMode="narrow" showLeftSidebar={false} showRightSidebar={false}>
      <div className="flex h-[calc(100vh-120px)] min-h-[500px] bg-gray-50 dark:bg-gray-950">
        <BuilderSidebar
          sections={sections}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mode="guided"
          saved={saved}
          saving={saving}
          onSave={handleSave}
          onDownload={handleDownload}
          isCollapsed={isCollapsed}
          onToggleCollapsed={() => setIsCollapsed((c) => !c)}
          onOpenActions={() => setActionsOpen(true)}
          onBack={() => navigate('/dashboard')}
          currentResume={currentResume}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-6 bg-white dark:bg-gray-900">
            <div className="max-w-xl mx-auto">{renderFormPanel()}</div>
          </div>

          <div className="w-1/2 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 flex items-start justify-center">
            <div className="w-full max-w-[210mm] shadow-lg">
              <ResumePreview template={selectedTemplate} sections={sections} />
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
      />

      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </MainLayout>
  );
};

export default memo(Builder);
