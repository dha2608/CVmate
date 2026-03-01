import { memo, useCallback, useMemo, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Zap } from 'lucide-react';
import { validateSkill } from '@/utils/validation';

interface SkillChipProps {
  skill: string;
  onRemove: (skill: string) => void;
}

const SkillChip = memo(function SkillChip({ skill, onRemove }: SkillChipProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 group hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all shadow-sm">
      {skill}
      <button 
        onClick={() => onRemove(skill)} 
        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        aria-label={`Remove ${skill}`}
      >
        <X size={14} />
      </button>
    </div>
  );
});

const SkillsForm = () => {
  const skills = useResumeStore((s) => s.currentResume.skills);
  const [inputValue, setInputValue] = useState('');

  const addSkill = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const store = useResumeStore.getState();
    const current = store.currentResume.skills;
    const validation = validateSkill(trimmed, current);
    if (!validation.valid) return;
    store.setSkills([...current, trimmed]);
    setInputValue('');
  }, [inputValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  }, [addSkill]);

  const removeSkill = useCallback((skillToRemove: string) => {
    const store = useResumeStore.getState();
    const current = store.currentResume.skills;
    store.setSkills(current.filter((skill) => skill !== skillToRemove));
  }, []);

  const isDuplicate = useMemo(
    () =>
      inputValue.length > 0 &&
      skills.some((skill) => skill.toLowerCase() === inputValue.trim().toLowerCase()),
    [inputValue, skills]
  );

  const chips = useMemo(
    () => skills.map((skill) => <SkillChip key={skill} skill={skill} onRemove={removeSkill} />),
    [removeSkill, skills]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Skills & Expertise</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            List your technical skills, programming languages, tools, and competencies
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= 50) {
                  setInputValue(val);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill and press Enter (e.g. React, Node.js, Python)"
              maxLength={50}
              className="bg-white dark:bg-gray-900 dark:border-gray-700"
            />
            <Button 
              onClick={addSkill} 
              variant="secondary" 
              disabled={!inputValue.trim() || isDuplicate}
              className="bg-gradient-to-r from-crimson-red to-fire-red hover:from-fire-red hover:to-crimson-red text-white disabled:opacity-50"
            >
              Add
            </Button>
          </div>
          {isDuplicate && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>⚠</span>
              <span>This skill is already added</span>
            </p>
          )}
          {inputValue.length > 40 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Skill name is getting long ({inputValue.length}/50)
            </p>
          )}
        </div>
      </div>

      {skills.length > 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-wrap gap-2">{chips}</div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Zap className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No skills added yet</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Add your technical skills, programming languages, and tools you're proficient with
          </p>
        </div>
      )}
    </div>
  );
};

export default memo(SkillsForm);
