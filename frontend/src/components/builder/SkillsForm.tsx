import { memo, useCallback, useMemo, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { validateSkill } from '@/utils/validation';

interface SkillChipProps {
  skill: string;
  onRemove: (skill: string) => void;
}

const SkillChip = memo(function SkillChip({ skill, onRemove }: SkillChipProps) {
  return (
    <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 group hover:bg-gray-200 transition-colors">
      {skill}
      <button onClick={() => onRemove(skill)} className="text-gray-400 hover:text-red-500">
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
      <h3 className="text-lg font-medium">Skills</h3>

      <div className="space-y-2">
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
            placeholder="Type a skill and press Enter (e.g. React, Node.js)"
            maxLength={50}
          />
          <Button onClick={addSkill} variant="secondary" disabled={!inputValue.trim()}>
            Add
          </Button>
        </div>
        {isDuplicate && <p className="text-xs text-amber-600">This skill is already added</p>}
        {inputValue.length > 40 && (
          <p className="text-xs text-amber-600">Skill name is getting long ({inputValue.length}/50)</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">{chips}</div>

      {skills.length === 0 && <p className="text-sm text-gray-400 italic mt-2">No skills added yet.</p>}
    </div>
  );
};

export default memo(SkillsForm);
