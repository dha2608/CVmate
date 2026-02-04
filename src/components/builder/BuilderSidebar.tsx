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
  Settings2
} from 'lucide-react';

export type BuilderSectionId = 'personal' | 'summary' | 'experience' | 'education' | 'skills';

export interface BuilderSection {
  id: BuilderSectionId;
  label: string;
  visible: boolean;
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
}: BuilderSidebarProps) => {
  const visibleSections = sections.filter((s) => s.visible !== false);
  const currentIndex = visibleSections.findIndex((s) => s.id === activeTab);
  const progress = ((currentIndex + 1) / visibleSections.length) * 100;

  return (
    <aside
      className={`h-full border-r border-gray-200 bg-gradient-to-b from-white to-gray-50/50 flex flex-col ${
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      } transition-all duration-300 ease-in-out shadow-sm`}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
        {!isCollapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-crimson-red to-fire-red text-white flex items-center justify-center font-black text-lg shadow-lg shadow-red-500/20">
              C
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-jet-black truncate">CV Builder</div>
              <div className="text-[10px] text-gray-500 truncate">Professional Resume</div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-crimson-red to-fire-red text-white flex items-center justify-center font-black text-lg shadow-lg shadow-red-500/20 mx-auto">
            C
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Progress Bar */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-600">Progress</span>
            <span className="text-xs font-bold text-crimson-red">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-crimson-red to-fire-red rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
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
            const isCompleted = currentIndex > index;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveTab(s.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 text-crimson-red border-2 border-red-200 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                }`}
                title={isCollapsed ? s.label : undefined}
              >
                <span className="flex-shrink-0 relative">
                  {isActive ? (
                    <div className="h-8 w-8 rounded-lg bg-crimson-red text-white flex items-center justify-center shadow-md">
                      <Icon size={16} />
                    </div>
                  ) : isCompleted ? (
                    <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                  )}
                </span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className={`font-semibold truncate ${isActive ? 'text-crimson-red' : 'text-gray-800'}`}>
                      {s.label}
                    </div>
                    {isActive && (
                      <div className="text-[10px] text-gray-500 mt-0.5">Currently editing</div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Actions */}
      <div className="border-t border-gray-200 bg-white p-3 space-y-2">
        {onOpenActions && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenActions}
            className="w-full border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          >
            <Settings2 size={14} className="mr-2" />
            {!isCollapsed && 'Settings'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="w-full border-2 border-gray-200 hover:border-crimson-red hover:text-crimson-red hover:bg-red-50 transition-all"
        >
          <Save size={14} className="mr-2" />
          {!isCollapsed && (saved ? '✓ Saved' : saving ? 'Saving…' : 'Save')}
        </Button>
        <Button
          size="sm"
          onClick={onDownload}
          className="w-full bg-gradient-to-r from-crimson-red to-fire-red hover:from-fire-red hover:to-crimson-red text-white shadow-md hover:shadow-lg transition-all"
        >
          <Download size={14} className="mr-2" />
          {!isCollapsed && 'Download PDF'}
        </Button>
      </div>
    </aside>
  );
};

export default BuilderSidebar;
