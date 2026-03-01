import { memo, useCallback, useMemo, useState } from 'react';
import { useResumeStore, type IEducation } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, GraduationCap, Brain } from 'lucide-react';

interface EducationItemProps {
  edu: IEducation;
  index: number;
  isEnhancing: boolean;
  onRemove: (index: number) => void;
  onUpdate: (index: number, edu: IEducation) => void;
  onToggleCurrent: (index: number, checked: boolean, currentEdu: IEducation) => void;
  onEnhance: (index: number, text: string) => void;
}

const EducationItem = memo(function EducationItem({
  edu,
  index,
  isEnhancing,
  onRemove,
  onUpdate,
  onToggleCurrent,
  onEnhance,
}: EducationItemProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 space-y-4 relative group hover:shadow-md transition-shadow">
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => onRemove(index)}
            >
              <Trash2 size={16} />
            </Button>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label>
            School / University <span className="text-red-500">*</span>
          </Label>
          <Input
            value={edu.institution}
            onChange={(e) => onUpdate(index, { ...edu, institution: e.target.value })}
            placeholder="e.g. Harvard University"
            className={`bg-white dark:bg-gray-900 dark:border-gray-700 ${!edu.institution?.trim() ? 'border-amber-300 dark:border-amber-600' : ''}`}
          />
          {!edu.institution?.trim() && (
            <p className="text-xs text-amber-600">Required field</p>
          )}
        </div>

        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label>
            Degree / Major <span className="text-red-500">*</span>
          </Label>
          <Input
            value={edu.degree}
            onChange={(e) => onUpdate(index, { ...edu, degree: e.target.value })}
            placeholder="e.g. Bachelor of Computer Science"
            className={`bg-white dark:bg-gray-900 dark:border-gray-700 ${!edu.degree?.trim() ? 'border-amber-300 dark:border-amber-600' : ''}`}
          />
          {!edu.degree?.trim() && (
            <p className="text-xs text-amber-600">Required field</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 col-span-2">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="month"
              value={edu.startDate}
              onChange={(e) => onUpdate(index, { ...edu, startDate: e.target.value })}
              className="bg-white dark:bg-gray-900 dark:border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label className="mb-0">End Date</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`current-${edu.id}`}
                  checked={edu.endDate === 'Present'}
                  onCheckedChange={(checked) =>
                    onToggleCurrent(index, checked as boolean, edu)
                  }
                />
                <label
                  htmlFor={`current-${edu.id}`}
                  className="text-xs text-gray-500 cursor-pointer"
                >
                  Currently study here
                </label>
              </div>
            </div>
            <Input
              type="month"
              value={edu.endDate === 'Present' ? '' : edu.endDate}
              disabled={edu.endDate === 'Present'}
              onChange={(e) => onUpdate(index, { ...edu, endDate: e.target.value })}
              placeholder={edu.endDate === 'Present' ? 'Present' : ''}
              className="bg-white dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
        </div>

        <div className="col-span-2 space-y-2">
          <div className="flex justify-between items-center">
            <Label>Description</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-purple-700 dark:text-purple-300 gap-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
              onClick={() => onEnhance(index, edu.description || '')}
              disabled={isEnhancing}
            >
              <Brain size={14} className={isEnhancing ? 'animate-spin' : ''} />
              {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
            </Button>
          </div>
          <Textarea
            value={edu.description || ''}
            onChange={(e) => onUpdate(index, { ...edu, description: e.target.value })}
            placeholder="• GPA: 3.8/4.0&#10;• Dean's List for 3 semesters&#10;• Capstone project: Built a full-stack web application"
            className="bg-white dark:bg-gray-900 dark:border-gray-700 min-h-[100px] text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Include GPA, honors, relevant coursework, or projects
          </p>
        </div>
      </div>
    </div>
  );
});

const EducationForm = () => {
  const education = useResumeStore((s) => s.currentResume.education);
  const [loadingAi, setLoadingAi] = useState<number | null>(null);

  const handleAdd = useCallback(() => {
    useResumeStore.getState().addEducation({
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    useResumeStore.getState().removeEducation(index);
  }, []);

  const handleUpdate = useCallback((index: number, edu: IEducation) => {
    useResumeStore.getState().updateEducation(index, edu);
  }, []);

  const handleCurrentStudyChange = useCallback((index: number, isChecked: boolean, currentEdu: IEducation) => {
    useResumeStore.getState().updateEducation(index, {
      ...currentEdu,
      endDate: isChecked ? 'Present' : '',
    });
  }, []);

  const handleEnhance = useCallback(async (index: number, text: string) => {
    if (!text?.trim()) {
      const { useToastStore } = await import('@/store/toastStore');
      useToastStore.getState().error('Please enter some text to enhance');
      return;
    }

    setLoadingAi(index);
    try {
      const enhanced = await useResumeStore.getState().aiEnhanceText(text, 'education');
      if (enhanced && enhanced !== text) {
        const edu = useResumeStore.getState().currentResume.education[index];
        if (edu) {
          useResumeStore.getState().updateEducation(index, {
            ...edu,
            id: edu.id || crypto.randomUUID(),
            description: enhanced,
          });
        }
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().success('Education description enhanced successfully!');
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
      education.map((edu, index) => (
        <EducationItem
          key={edu.id || index}
          edu={edu}
          index={index}
          isEnhancing={loadingAi === index}
          onRemove={handleRemove}
          onUpdate={handleUpdate}
          onToggleCurrent={handleCurrentStudyChange}
          onEnhance={handleEnhance}
        />
      )),
    [education, handleCurrentStudyChange, handleEnhance, handleRemove, handleUpdate, loadingAi]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Education</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add your academic qualifications, certifications, and training
            </p>
          </div>
          <Button 
            onClick={handleAdd} 
            size="sm" 
            className="gap-2 bg-gradient-to-r from-crimson-red to-fire-red hover:from-fire-red hover:to-crimson-red text-white shadow-md"
          >
            <Plus size={16} /> Add Education
          </Button>
        </div>
      </div>

      <div className="space-y-4">{items}</div>

      {education.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No education added yet</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Add your degrees, certifications, or training programs
          </p>
          <Button 
            onClick={handleAdd} 
            size="sm" 
            className="gap-2 bg-gradient-to-r from-crimson-red to-fire-red hover:from-fire-red hover:to-crimson-red text-white"
          >
            <Plus size={16} /> Add Your First Education
          </Button>
        </div>
      )}
    </div>
  );
};

export default memo(EducationForm);
