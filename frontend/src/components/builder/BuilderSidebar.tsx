import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  Download, 
  Save, 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Settings2,
  ArrowLeft
} from 'lucide-react';

export type BuilderSectionId = 'personal' | 'summary' | 'experience' | 'education' | 'skills';

export interface BuilderSection {
  id: BuilderSectionId;
  label: string;
  visible: boolean;
}

interface ResumeData {
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: string[];
}

interface BuilderSidebarProps {
  sections: BuilderSection[];
  activeTab: BuilderSectionId;
  setActiveTab: (id: BuilderSectionId) => void;
  mode: 'guided' | 'power';
  saved: boolean;
  saving: boolean;
  onSave: () => void;
  onDownload: () => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenActions?: () => void;
  onBack?: () => void;
  currentResume?: ResumeData;
}

const sectionIcons: Record<BuilderSectionId, typeof User> = {
  personal: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Zap,
};

const BuilderSidebar = ({
  sections,
  activeTab,
  setActiveTab,
  mode,
  saved,
  saving,
  onSave,
  onDownload,
  isCollapsed,
  onToggleCollapsed,
  onOpenActions,
  onBack,
  currentResume,
}: BuilderSidebarProps) => {
  const visibleSections = sections.filter((s) => s.visible !== false);
  
  // Calculate real progress based on actual data
  const calculateProgress = () => {
    if (!currentResume) {return 0;}
    
    let completed = 0;
    const total = visibleSections.length;
    
    // Personal Info: at least name and email
    if (currentResume.personalInfo?.fullName?.trim() && currentResume.personalInfo?.email?.trim()) {
      completed++;
    }
    
    // Summary: has content
    if (currentResume.summary?.trim()) {
      completed++;
    }
    
    // Experience: has at least one complete entry
    if (currentResume.experience && currentResume.experience.length > 0) {
      const hasComplete = currentResume.experience.some(
        exp => exp.company?.trim() && exp.position?.trim()
      );
      if (hasComplete) {completed++;}
    }
    
    // Education: has at least one complete entry
    if (currentResume.education && currentResume.education.length > 0) {
      const hasComplete = currentResume.education.some(
        edu => edu.institution?.trim() && edu.degree?.trim()
      );
      if (hasComplete) {completed++;}
    }
    
    // Skills: has at least one skill
    if (currentResume.skills && currentResume.skills.length > 0 && currentResume.skills.some(s => s.trim())) {
      completed++;
    }
    
    return Math.round((completed / total) * 100);
  };
  
  const progress = calculateProgress();

  return (
    <aside
      className={`h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col ${
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      } transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {!isCollapsed && (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-colors flex-shrink-0"
                title="Back to Dashboard"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-crimson-red to-fire-red text-white flex items-center justify-center font-black text-lg shadow-lg shadow-red-500/20 flex-shrink-0">
              C
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">CV Builder</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Professional Resume</div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors mx-auto mb-2"
                title="Back to Dashboard"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-crimson-red to-fire-red text-white flex items-center justify-center font-black text-lg shadow-lg shadow-red-500/20 mx-auto">
              C
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Progress Bar */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Completion</span>
            <span className="text-xs font-bold text-crimson-red dark:text-red-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-crimson-red to-fire-red rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="text-[10px] text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>CV is complete!</span>
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {!isCollapsed && (
          <div className="text-[10px] uppercase tracking-wider text-gray-400 px-2 py-2 font-bold">
            Sections
          </div>
        )}
        <div className="space-y-1">
          {visibleSections.map((s, index) => {
            const isActive = activeTab === s.id;
            const Icon = sectionIcons[s.id];
            
            // Check if section is actually completed
            const isCompleted = (() => {
              if (!currentResume) {return false;}
              switch (s.id) {
                case 'personal':
                  return !!(currentResume.personalInfo?.fullName?.trim() && currentResume.personalInfo?.email?.trim());
                case 'summary':
                  return !!currentResume.summary?.trim();
                case 'experience':
                  return !!(currentResume.experience && currentResume.experience.length > 0 && 
                    currentResume.experience.some(exp => exp.company?.trim() && exp.position?.trim()));
                case 'education':
                  return !!(currentResume.education && currentResume.education.length > 0 && 
                    currentResume.education.some(edu => edu.institution?.trim() && edu.degree?.trim()));
                case 'skills':
                  return !!(currentResume.skills && currentResume.skills.length > 0 && 
                    currentResume.skills.some(skill => skill.trim()));
                default:
                  return false;
              }
            })();

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveTab(s.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-xl ${isCollapsed ? 'px-2 py-2' : 'px-3 py-2.5'} text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 text-crimson-red dark:text-red-400 border-2 border-red-200 dark:border-red-800 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent'
                }`}
                title={isCollapsed ? s.label : undefined}
              >
                <span className="flex-shrink-0 relative">
                  {isActive ? (
                    <div className={`${isCollapsed ? 'h-10 w-10' : 'h-8 w-8'} rounded-lg bg-crimson-red text-white flex items-center justify-center shadow-md`}>
                      <Icon size={isCollapsed ? 18 : 16} />
                    </div>
                  ) : isCompleted ? (
                    <div className={`${isCollapsed ? 'h-10 w-10' : 'h-8 w-8'} rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center`}>
                      <CheckCircle2 size={isCollapsed ? 18 : 16} />
                    </div>
                  ) : (
                    <div className={`${isCollapsed ? 'h-10 w-10' : 'h-8 w-8'} rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 flex items-center justify-center`}>
                      <Icon size={isCollapsed ? 18 : 16} />
                    </div>
                  )}
                </span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className={`font-semibold truncate ${isActive ? 'text-crimson-red dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {s.label}
                    </div>
                    {isActive && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Currently editing</div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 space-y-2">
        {!isCollapsed && (
          <div className="px-2 pb-2">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold mb-1.5">
              Quick Actions
            </div>
          </div>
        )}
        {onOpenActions && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenActions}
            className="w-full border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Templates, sections, and AI tools"
          >
            <Settings2 size={14} className="mr-2" />
            {!isCollapsed && 'Settings & More'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="w-full border-2 border-gray-200 dark:border-gray-700 hover:border-crimson-red dark:hover:border-red-600 hover:text-crimson-red dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          title="Save your CV (Ctrl+S)"
        >
          <Save size={14} className={`mr-2 ${saving ? 'animate-spin' : ''}`} />
          {!isCollapsed && (saved ? '✓ Saved' : saving ? 'Saving…' : 'Save CV')}
        </Button>
        <Button
          size="sm"
          onClick={onDownload}
          className="w-full bg-gradient-to-r from-crimson-red to-fire-red hover:from-fire-red hover:to-crimson-red text-white shadow-md hover:shadow-lg transition-all"
          title="Download as PDF (Ctrl+D)"
        >
          <Download size={14} className="mr-2" />
          {!isCollapsed && 'Download PDF'}
        </Button>
        {!isCollapsed && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 px-2 pt-1 text-center">
            💡 Tip: Press Ctrl+S to save, Ctrl+D to download
          </p>
        )}
      </div>
    </aside>
  );
};

export default BuilderSidebar;
