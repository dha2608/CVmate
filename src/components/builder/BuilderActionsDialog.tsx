import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard, LayoutTemplate, ListTree, Sparkles, X, Zap } from 'lucide-react';
import TemplateSelector from '@/components/builder/TemplateSelector';
import SectionReorder from '@/components/builder/SectionReorder';
import AISuggestions from '@/components/builder/AISuggestions';

interface QuickPreset {
  id: string;
  label: string;
  description: string;
  apply: () => void;
}

interface BuilderActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  sections: { id: string; label: string; visible: boolean }[];
  onReorderSections: (sections: { id: string; label: string; visible: boolean }[]) => void;
  onToggleSectionVisibility: (id: string) => void;
  onOpenShortcuts: () => void;
  quickPresets?: QuickPreset[];
}

const BuilderActionsDialog = ({
  open,
  onOpenChange,
  selectedTemplate,
  onSelectTemplate,
  sections,
  onReorderSections,
  onToggleSectionVisibility,
  onOpenShortcuts,
  quickPresets = [],
}: BuilderActionsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-sm font-black text-jet-black">Actions</div>
            <div className="text-xs text-gray-500">Templates, sections, AI tools</div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 w-9 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Template Selection - Most Important */}
          <div className="rounded-xl border-2 border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <LayoutTemplate size={18} className="text-crimson-red" />
              <div>
                <div className="text-sm font-bold text-gray-900">CV Template</div>
                <div className="text-xs text-gray-500">Choose a design for your CV</div>
              </div>
            </div>
            <TemplateSelector selectedTemplate={selectedTemplate} onSelect={onSelectTemplate} />
          </div>

          {/* Quick Start - Only if available */}
          {quickPresets.length > 0 && (
            <div className="rounded-xl border border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={18} className="text-yellow-500" />
                <div>
                  <div className="text-sm font-bold text-gray-900">Quick Start</div>
                  <div className="text-xs text-gray-500">Pre-fill with example data</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      preset.apply();
                      onOpenChange(false);
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-crimson-red hover:text-crimson-red hover:bg-red-50 transition-all text-sm font-medium"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sections Management - Collapsible */}
          <details className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <summary className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTree size={18} className="text-gray-600" />
                <div>
                  <div className="text-sm font-bold text-gray-900">Manage Sections</div>
                  <div className="text-xs text-gray-500">Reorder or hide sections</div>
                </div>
              </div>
            </summary>
            <div className="px-4 pb-4">
              <SectionReorder
                sections={sections}
                onReorder={onReorderSections}
                onToggleVisibility={onToggleSectionVisibility}
              />
            </div>
          </details>

          {/* AI Suggestions - Collapsible */}
          <details className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <summary className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" />
                <div>
                  <div className="text-sm font-bold text-gray-900">AI Suggestions</div>
                  <div className="text-xs text-gray-500">Get AI-powered recommendations</div>
                </div>
              </div>
            </summary>
            <div className="px-4 pb-4">
              <AISuggestions />
            </div>
          </details>
        </div>

        <div className="p-4 sm:p-5 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenShortcuts();
              onOpenChange(false);
            }}
            className="border-gray-200 hover:border-gray-300"
          >
            <Keyboard size={16} className="mr-2" />
            Shortcuts
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-crimson-red hover:bg-fire-red text-white"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuilderActionsDialog;
