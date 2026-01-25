import { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

const SkillsForm = () => {
  const { currentResume, setSkills } = useResumeStore();
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !currentResume.skills.includes(trimmed)) {
      setSkills([...currentResume.skills, trimmed]);
      setInputValue('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(currentResume.skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
        <h3 className="text-lg font-medium">Skills</h3>
        
        <div className="flex gap-2">
            <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a skill and press Enter (e.g. React, Node.js)"
            />
            <Button onClick={addSkill} variant="secondary">Add</Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
            {currentResume.skills.map((skill) => (
                <div key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 group hover:bg-gray-200 transition-colors">
                    {skill}
                    <button 
                        onClick={() => removeSkill(skill)}
                        className="text-gray-400 hover:text-red-500"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>

        {currentResume.skills.length === 0 && (
             <p className="text-sm text-gray-400 italic mt-2">No skills added yet.</p>
        )}
    </div>
  );
};

export default SkillsForm;
