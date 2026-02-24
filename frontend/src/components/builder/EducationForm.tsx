import { memo, useCallback, useMemo } from 'react';
import { useResumeStore, type IEducation } from '@/store/resumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, GraduationCap } from 'lucide-react';

interface EducationItemProps {
  edu: IEducation;
  index: number;
  onRemove: (index: number) => void;
  onUpdate: (index: number, edu: IEducation) => void;
  onToggleCurrent: (index: number, checked: boolean, currentEdu: IEducation) => void;
}

const EducationItem = memo(function EducationItem({
  edu,
  index,
  onRemove,
  onUpdate,
  onToggleCurrent,
}: EducationItemProps) {
  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 group">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
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
          <div className="relative">
            <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              value={edu.institution}
              onChange={(e) => onUpdate(index, { ...edu, institution: e.target.value })}
              placeholder="Harvard University"
              className={`pl-9 ${!edu.institution?.trim() ? 'border-amber-300' : ''}`}
            />
          </div>
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
            placeholder="Bachelor of Computer Science"
            className={!edu.degree?.trim() ? 'border-amber-300' : ''}
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
            />
          </div>
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Description</Label>
          <Input
            value={edu.description || ''}
            onChange={(e) => onUpdate(index, { ...edu, description: e.target.value })}
            placeholder="Achievements, GPA, etc."
          />
        </div>
      </div>
    </div>
  );
});

const EducationForm = () => {
  const { education, addEducation, updateEducation, removeEducation } = useResumeStore(
    (s) => ({
      education: s.currentResume.education,
      addEducation: s.addEducation,
      updateEducation: s.updateEducation,
      removeEducation: s.removeEducation,
    })
  );

  const handleAdd = useCallback(() => {
    const newEdu: IEducation = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    addEducation(newEdu);
  }, [addEducation]);

  const handleRemove = useCallback((index: number) => removeEducation(index), [removeEducation]);

  const handleUpdate = useCallback(
    (index: number, edu: IEducation) => updateEducation(index, edu),
    [updateEducation]
  );

  const handleCurrentStudyChange = useCallback(
    (index: number, isChecked: boolean, currentEdu: IEducation) => {
      updateEducation(index, {
        ...currentEdu,
        endDate: isChecked ? 'Present' : '',
      });
    },
    [updateEducation]
  );

  const items = useMemo(
    () =>
      education.map((edu, index) => (
        <EducationItem
          key={edu.id}
          edu={edu}
          index={index}
          onRemove={handleRemove}
          onUpdate={handleUpdate}
          onToggleCurrent={handleCurrentStudyChange}
        />
      )),
    [education, handleCurrentStudyChange, handleRemove, handleUpdate]
  );

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

      <div className="space-y-4">{items}</div>
    </div>
  );
};

export default memo(EducationForm);
