import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Keyboard,
  LayoutTemplate,
  ListTree,
  Sparkles,
  X,
  Zap,
  Wand2,
  BarChart3,
} from 'lucide-react';
import TemplateSelector from '@/components/builder/TemplateSelector';
import SectionReorder from '@/components/builder/SectionReorder';
import AISuggestions from '@/components/builder/AISuggestions';
import type { BuilderSection } from './BuilderSidebar';

interface QuickPreset {
  id: string;
  label: string;
  description: string;
  apply: () => void;
}

export type AiGeneratePayload = {
  prompt?: string;
  jobDescription?: string;
  role?: 'frontend' | 'backend' | 'fullstack' | 'qa' | 'designer' | 'devops' | 'data' | 'other';
  mode?: 'concise' | 'human';
};

export type AtsAnalysisResult = {
  score?: number;
  strengths?: string[];
  improvements?: string[];
  summary?: string;
  missingKeywords?: string[];
  matchScore?: number;
};

interface BuilderActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  sections: BuilderSection[];
  onReorderSections: (sections: BuilderSection[]) => void;
  onToggleSectionVisibility: (id: string) => void;
  onOpenShortcuts: () => void;
  quickPresets?: QuickPreset[];
  onAiGenerate?: (payload: AiGeneratePayload) => Promise<void>;
  onAtsAnalyze?: (jobDescription: string) => Promise<void>;
  atsAnalysis?: AtsAnalysisResult | null;
  atsAnalyzing?: boolean;
}

const ROLES: { value: AiGeneratePayload['role']; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full-stack' },
  { value: 'qa', label: 'QA' },
  { value: 'designer', label: 'Designer' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data' },
  { value: 'other', label: 'Other' },
];

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
  onAiGenerate,
  onAtsAnalyze,
  atsAnalysis,
  atsAnalyzing = false,
}: BuilderActionsDialogProps) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiRole, setAiRole] = useState<AiGeneratePayload['role']>('fullstack');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  const handleAiGenerate = async () => {
    if (!onAiGenerate) return;
    setAiGenerating(true);
    try {
      await onAiGenerate({ prompt: aiPrompt || undefined, role: aiRole });
      onOpenChange(false);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAtsAnalyze = async () => {
    if (!onAtsAnalyze || !jobDescription.trim()) return;
    await onAtsAnalyze(jobDescription.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {onAiGenerate && (
            <div className="rounded-xl border-2 border-purple-200 p-4 bg-purple-50/50 dark:bg-purple-900/20 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 size={18} className="text-purple-600" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    AI Generate CV
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Describe your experience or paste a job description
                  </div>
                </div>
              </div>
              <Textarea
                placeholder="e.g. 5 years React, 2 years Node.js, looking for senior role..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[80px] mb-3 text-sm"
              />
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Role:</span>
                <select
                  value={aiRole}
                  onChange={(e) => setAiRole(e.target.value as AiGeneratePayload['role'])}
                  className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiGenerating}
                className="w-full sm:w-auto gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Wand2 size={16} />
                {aiGenerating ? 'Generating…' : 'Generate CV with AI'}
              </Button>
            </div>
          )}

          {onAtsAnalyze && (
            <div className="rounded-xl border-2 border-blue-200 p-4 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={18} className="text-blue-600" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">ATS Checker</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Paste Job Description to compare with current CV
                  </div>
                </div>
              </div>

              <Textarea
                placeholder="Paste full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[120px] mb-3 text-sm"
              />

              <Button
                type="button"
                onClick={handleAtsAnalyze}
                disabled={atsAnalyzing || !jobDescription.trim()}
                className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <BarChart3 size={16} />
                {atsAnalyzing ? 'Analyzing…' : 'Analyze ATS Match'}
              </Button>

              {atsAnalysis && (
                <div className="mt-4 space-y-3 rounded-lg border border-blue-100 dark:border-blue-800 bg-white/80 dark:bg-gray-900/40 p-3">
                  <div className="flex flex-wrap gap-4 text-sm font-semibold">
                    <span className="text-gray-800 dark:text-gray-100">
                      ATS Score: <span className="text-blue-600">{atsAnalysis.score ?? 0}%</span>
                    </span>
                    <span className="text-gray-800 dark:text-gray-100">
                      JD Match:{' '}
                      <span className="text-blue-600">
                        {atsAnalysis.matchScore ?? atsAnalysis.score ?? 0}%
                      </span>
                    </span>
                  </div>

                  {atsAnalysis.summary && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {atsAnalysis.summary}
                    </p>
                  )}

                  {!!atsAnalysis.missingKeywords?.length && (
                    <div>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        Missing keywords
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {atsAnalysis.missingKeywords.map((kw, idx) => (
                          <span
                            key={`${kw}-${idx}`}
                            className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <details className="rounded-xl border border-gray-200 bg-white dark:bg-gray-800 overflow-hidden">
            <summary className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    AI Suggestions
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Get AI-powered recommendations
                  </div>
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
