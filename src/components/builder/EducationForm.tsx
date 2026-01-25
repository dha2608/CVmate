import { useResumeStore, Education } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';

const EducationForm = () => {
  const { currentResume, addEducation, updateEducation, removeEducation } = useResumeStore();

  const handleAdd = () => {
      const newEdu: Education = {
          id: Date.now().toString(),
          institution: '',
          degree: '',
          startDate: '',
          endDate: '',
          description: ''
      };
      addEducation(newEdu);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
        <h3 className="text-lg font-medium flex justify-between items-center">
            Education
            <Button size="sm" onClick={handleAdd} className="gap-2">
                <Plus size={16} /> Add Education
            </Button>
        </h3>
        
        {currentResume.education.map((edu, index) => (
            <div key={edu.id || index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4 relative group">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeEducation(index)}
                >
                    <Trash2 size={18} />
                </Button>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-gray-500">Institution</label>
                        <Input 
                            value={edu.institution} 
                            onChange={(e) => updateEducation(index, { ...edu, institution: e.target.value })}
                            placeholder="University / School"
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-gray-500">Degree</label>
                        <Input 
                            value={edu.degree} 
                            onChange={(e) => updateEducation(index, { ...edu, degree: e.target.value })}
                            placeholder="Bachelor of Science"
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-gray-500">Start Date</label>
                        <Input 
                            value={edu.startDate} 
                            onChange={(e) => updateEducation(index, { ...edu, startDate: e.target.value })}
                            placeholder="YYYY"
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-gray-500">End Date</label>
                        <Input 
                            value={edu.endDate} 
                            onChange={(e) => updateEducation(index, { ...edu, endDate: e.target.value })}
                            placeholder="YYYY"
                            className="bg-white"
                        />
                    </div>
                </div>
            </div>
        ))}

        {currentResume.education.length === 0 && (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                No education added yet. Click "Add Education" to start.
            </div>
        )}
    </div>
  );
};

export default EducationForm;
