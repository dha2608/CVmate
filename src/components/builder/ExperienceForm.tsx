import { useState } from 'react';
import { useResumeStore, Experience } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Sparkles, Plus } from 'lucide-react';

const ExperienceForm = () => {
  const { currentResume, addExperience, updateExperience, removeExperience, aiEnhanceText } = useResumeStore();
  const [loadingAi, setLoadingAi] = useState<number | null>(null);

  const handleAdd = () => {
      const newExp: Experience = {
          id: Date.now().toString(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: ''
      };
      addExperience(newExp);
  };

  const handleEnhance = async (index: number, text: string) => {
      if (!text) return;
      setLoadingAi(index);
      const enhanced = await aiEnhanceText(text, 'experience');
      updateExperience(index, { ...currentResume.experience[index], description: enhanced });
      setLoadingAi(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
        <h3 className="text-lg font-medium flex justify-between items-center">
            Work Experience
            <Button size="sm" onClick={handleAdd} className="gap-2">
                <Plus size={16} /> Add Position
            </Button>
        </h3>
        
        {currentResume.experience.map((exp, index) => (
            <div key={exp.id || index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4 relative group">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExperience(index)}
                >
                    <Trash2 size={18} />
                </Button>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-gray-500">Company</label>
                        <Input 
                            value={exp.company} 
                            onChange={(e) => updateExperience(index, { ...exp, company: e.target.value })}
                            placeholder="Company Name"
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-gray-500">Position</label>
                        <Input 
                            value={exp.position} 
                            onChange={(e) => updateExperience(index, { ...exp, position: e.target.value })}
                            placeholder="Job Title"
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-gray-500">Start Date</label>
                        <Input 
                            value={exp.startDate} 
                            onChange={(e) => updateExperience(index, { ...exp, startDate: e.target.value })}
                            placeholder="MM/YYYY"
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-gray-500">End Date</label>
                        <Input 
                            value={exp.endDate} 
                            onChange={(e) => updateExperience(index, { ...exp, endDate: e.target.value })}
                            placeholder="MM/YYYY or Present"
                            className="bg-white"
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <label className="text-xs font-medium uppercase text-gray-500">Description</label>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs text-accent gap-1 hover:bg-red-50"
                            onClick={() => handleEnhance(index, exp.description)}
                            disabled={loadingAi === index}
                        >
                            <Sparkles size={12} />
                            {loadingAi === index ? 'Enhancing...' : 'AI Enhance'}
                        </Button>
                     </div>
                     <Textarea 
                        value={exp.description} 
                        onChange={(e) => updateExperience(index, { ...exp, description: e.target.value })}
                        placeholder="• Achieved X by doing Y..."
                        className="bg-white min-h-[100px]"
                     />
                </div>
            </div>
        ))}

        {currentResume.experience.length === 0 && (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                No experience added yet. Click "Add Position" to start.
            </div>
        )}
    </div>
  );
};

export default ExperienceForm;
