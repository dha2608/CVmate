import React from 'react';
import { useResumeStore, type IEducation } from '@/store/resumeStore'; // Import đúng type
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, GraduationCap } from 'lucide-react';

const EducationForm = () => {
  const { currentResume, addEducation, updateEducation, removeEducation } = useResumeStore();

  const handleAdd = () => {
    const newEdu: IEducation = {
      id: crypto.randomUUID(), 
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    addEducation(newEdu);
  };

  const handleCurrentStudyChange = (index: number, isChecked: boolean, currentEdu: IEducation) => {
    updateEducation(index, {
        ...currentEdu,
        endDate: isChecked ? 'Present' : ''
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <div>
            <h3 className="text-lg font-semibold text-gray-800">Education</h3>
            <p className="text-sm text-gray-500">Add your academic background</p>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus size={16} /> Add Education
        </Button>
      </div>

      <div className="space-y-4">
        {currentResume.education.map((edu, index) => (
          <div key={edu.id} className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 group">
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeEducation(index)}
                >
                    <Trash2 size={16} />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>School / University</Label>
                <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, { ...edu, institution: e.target.value })}
                        placeholder="Harvard University"
                        className="pl-9"
                    />
                </div>
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Degree / Major</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, { ...edu, degree: e.target.value })}
                  placeholder="Bachelor of Computer Science"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, { ...edu, startDate: e.target.value })}
                    />
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <Label className="mb-0">End Date</Label>
                        <div className="flex items-center gap-2">
                            <Checkbox 
                                id={`current-${edu.id}`}
                                checked={edu.endDate === 'Present'}
                                onCheckedChange={(checked) => handleCurrentStudyChange(index, checked as boolean, edu)}
                            />
                            <label htmlFor={`current-${edu.id}`} className="text-xs text-gray-500 cursor-pointer">
                                Currently study here
                            </label>
                        </div>
                    </div>
                    <Input
                        type="month"
                        value={edu.endDate === 'Present' ? '' : edu.endDate}
                        disabled={edu.endDate === 'Present'}
                        onChange={(e) => updateEducation(index, { ...edu, endDate: e.target.value })}
                        placeholder={edu.endDate === 'Present' ? 'Present' : ''}
                    />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Input 
                    value={edu.description || ''}
                    onChange={(e) => updateEducation(index, { ...edu, description: e.target.value })}
                    placeholder="Achievements, GPA, etc."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationForm;