import { memo, useCallback, useMemo, useState } from 'react';
import { useResumeStore, type IExperience } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Brain, Plus } from 'lucide-react';

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
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4 relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(index)}
      >
        <Trash2 size={18} />
      </Button>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-gray-500">
            Company <span className="text-red-500">*</span>
          </label>
          <Input
            value={exp.company}
            onChange={(e) => onUpdate(index, { ...exp, company: e.target.value })}
            placeholder="Company Name"
            className={`bg-white ${!exp.company?.trim() ? 'border-amber-300' : ''}`}
          />
          {!exp.company?.trim() && (
            <p className="text-xs text-amber-600">Required field</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-gray-500">
            Position <span className="text-red-500">*</span>
          </label>
          <Input
            value={exp.position}
            onChange={(e) => onUpdate(index, { ...exp, position: e.target.value })}
            placeholder="Job Title"
            className={`bg-white ${!exp.position?.trim() ? 'border-amber-300' : ''}`}
          />
          {!exp.position?.trim() && (
            <p className="text-xs text-amber-600">Required field</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-gray-500">
            Start Date
          </label>
          <Input
            value={exp.startDate}
            onChange={(e) => onUpdate(index, { ...exp, startDate: e.target.value })}
            placeholder="MM/YYYY"
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-gray-500">
            End Date
          </label>
          <Input
            value={exp.endDate}
            onChange={(e) => onUpdate(index, { ...exp, endDate: e.target.value })}
            placeholder="MM/YYYY or Present"
            className="bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium uppercase text-gray-500">
            Description
          </label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-accent gap-1 hover:bg-red-50"
            onClick={() => onEnhance(index, exp.description)}
            disabled={isEnhancing}
          >
            <Brain size={12} />
            {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
          </Button>
        </div>
        <Textarea
          value={exp.description}
          onChange={(e) => onUpdate(index, { ...exp, description: e.target.value })}
          placeholder="• Achieved X by doing Y..."
          className="bg-white min-h-[100px]"
        />
      </div>
    </div>
  );
});

const ExperienceForm = () => {
  const { experience, addExperience, updateExperience, removeExperience, aiEnhanceText } = useResumeStore(
    (s) => ({
      experience: s.currentResume.experience,
      addExperience: s.addExperience,
      updateExperience: s.updateExperience,
      removeExperience: s.removeExperience,
      aiEnhanceText: s.aiEnhanceText,
    })
  );

  const [loadingAi, setLoadingAi] = useState<number | null>(null);

  const handleAdd = useCallback(() => {
    const newExp: IExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    addExperience(newExp);
  }, [addExperience]);

  const handleRemove = useCallback((index: number) => removeExperience(index), [removeExperience]);

  const handleUpdate = useCallback(
    (index: number, exp: IExperience) => {
      updateExperience(index, exp);
    },
    [updateExperience]
  );

  const handleEnhance = useCallback(
    async (index: number, text: string) => {
      if (!text?.trim()) {
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().error('Please enter some text to enhance');
        return;
      }

      setLoadingAi(index);
      try {
        const enhanced = await aiEnhanceText(text, 'experience');
        if (enhanced && enhanced !== text) {
          const currentExp = experience[index];
          if (currentExp) {
            updateExperience(index, {
              id: currentExp.id || `exp-${Date.now()}`,
              company: currentExp.company || '',
              position: currentExp.position || '',
              startDate: currentExp.startDate || '',
              endDate: currentExp.endDate || '',
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
    },
    [aiEnhanceText, experience, updateExperience]
  );

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
      <h3 className="text-lg font-medium flex justify-between items-center">
        Work Experience
        <Button size="sm" onClick={handleAdd} className="gap-2">
          <Plus size={16} /> Add Position
        </Button>
      </h3>

      {items}

      {experience.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          No experience added yet. Click "Add Position" to start.
        </div>
      )}
    </div>
  );
};

export default memo(ExperienceForm);
