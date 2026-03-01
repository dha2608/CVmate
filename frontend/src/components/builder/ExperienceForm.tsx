import { memo, useCallback, useMemo, useState } from 'react';
import { useResumeStore, type IExperience } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Brain, Plus, Briefcase } from 'lucide-react';

interface ExperienceItemProps {
  exp: IExperience;
  index: number;
  isEnhancing: boolean;
  onRemove: (index: number) => void;
  onUpdate: (index: number, exp: IExperience) => void;
  onEnhance: (index: number, text: string) => void;
}

const ExperienceItem = memo(function ExperienceItem({
  exp,
  index,
  isEnhancing,
  onRemove,
  onUpdate,
  onEnhance,
}: ExperienceItemProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 space-y-4 relative group hover:shadow-md transition-shadow">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(index)}
      >
        <Trash2 size={18} />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Company <span className="text-red-500">*</span>
          </label>
          <Input
            value={exp.company}
            onChange={(e) => onUpdate(index, { ...exp, company: e.target.value })}
            placeholder="e.g. Google, Microsoft"
            className={`bg-white dark:bg-gray-900 dark:border-gray-700 ${!exp.company?.trim() ? 'border-amber-300 dark:border-amber-600' : ''}`}
          />
          {!exp.company?.trim() && (
            <p className="text-xs text-amber-600 dark:text-amber-400">Required field</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Position <span className="text-red-500">*</span>
          </label>
          <Input
            value={exp.position}
            onChange={(e) => onUpdate(index, { ...exp, position: e.target.value })}
            placeholder="e.g. Senior Software Engineer"
            className={`bg-white dark:bg-gray-900 dark:border-gray-700 ${!exp.position?.trim() ? 'border-amber-300 dark:border-amber-600' : ''}`}
          />
          {!exp.position?.trim() && (
            <p className="text-xs text-amber-600 dark:text-amber-400">Required field</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Start Date
          </label>
          <Input
            value={exp.startDate}
            onChange={(e) => onUpdate(index, { ...exp, startDate: e.target.value })}
            placeholder="MM/YYYY or YYYY"
            className="bg-white dark:bg-gray-900 dark:border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            End Date
          </label>
          <Input
            value={exp.endDate}
            onChange={(e) => onUpdate(index, { ...exp, endDate: e.target.value })}
            placeholder="MM/YYYY, YYYY, or Present"
            className="bg-white dark:bg-gray-900 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Description & Achievements
          </label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-purple-700 dark:text-purple-300 gap-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
            onClick={() => onEnhance(index, exp.description)}
            disabled={isEnhancing}
          >
            <Brain size={14} className={isEnhancing ? 'animate-spin' : ''} />
            {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
          </Button>
        </div>
        <Textarea
          value={exp.description}
          onChange={(e) => onUpdate(index, { ...exp, description: e.target.value })}
          placeholder="• Led a team of 5 developers to deliver a new feature that increased user engagement by 30%&#10;• Optimized database queries reducing response time by 40%&#10;• Implemented CI/CD pipeline reducing deployment time by 50%"
          className="bg-white dark:bg-gray-900 dark:border-gray-700 min-h-[120px] text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Use bullet points to highlight your achievements and responsibilities
        </p>
      </div>
    </div>
  );
});

const ExperienceForm = () => {
  const experience = useResumeStore((s) => s.currentResume.experience);
  const [loadingAi, setLoadingAi] = useState<number | null>(null);

  const handleAdd = useCallback(() => {
    useResumeStore.getState().addExperience({
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    useResumeStore.getState().removeExperience(index);
  }, []);

  const handleUpdate = useCallback((index: number, exp: IExperience) => {
    useResumeStore.getState().updateExperience(index, exp);
  }, []);

  const handleEnhance = useCallback(async (index: number, text: string) => {
    if (!text?.trim()) {
      const { useToastStore } = await import('@/store/toastStore');
      useToastStore.getState().error('Please enter some text to enhance');
      return;
    }
    setLoadingAi(index);
    try {
      const enhanced = await useResumeStore.getState().aiEnhanceText(text, 'experience');
      if (enhanced && enhanced !== text) {
        const exp = useResumeStore.getState().currentResume.experience[index];
        if (exp) {
          useResumeStore.getState().updateExperience(index, {
            id: exp.id || `exp-${Date.now()}`,
            company: exp.company || '',
            position: exp.position || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            description: enhanced,
          });
        }
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().success('Description enhanced successfully!');
      }
    } catch (error: any) {
      const { useToastStore } = await import('@/store/toastStore');
      const errorMsg = error?.message || 'Failed to enhance text';
      if (!errorMsg.toLowerCase().includes('unavailable') && !errorMsg.toLowerCase().includes('api key')) {
        useToastStore.getState().error(errorMsg);
      }
    } finally {
      setLoadingAi(null);
    }
  }, []);

  const items = useMemo(
    () =>
      experience.map((exp, index) => (
        <ExperienceItem
          key={exp.id || index}
          exp={exp}
          index={index}
          isEnhancing={loadingAi === index}
          onRemove={handleRemove}
          onUpdate={handleUpdate}
          onEnhance={handleEnhance}
        />
      )),
    [experience, handleEnhance, handleRemove, handleUpdate, loadingAi]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              List your professional work history, starting with your most recent position
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleAdd} 
            className="gap-2 bg-gradient-to-r from-crimson-red to-fire-red hover:from-fire-red hover:to-crimson-red text-white shadow-md"
          >
            <Plus size={16} /> Add Position
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {items}
      </div>

      {experience.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No experience added yet</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Start building your professional profile by adding your work experience
          </p>
          <Button 
            size="sm" 
            onClick={handleAdd} 
            className="gap-2 bg-gradient-to-r from-crimson-red to-fire-red hover:from-fire-red hover:to-crimson-red text-white"
          >
            <Plus size={16} /> Add Your First Position
          </Button>
        </div>
      )}
    </div>
  );
};

export default memo(ExperienceForm);
