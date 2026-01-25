import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';

const PersonalForm = () => {
  const { currentResume, updatePersonalInfo } = useResumeStore();
  const { personalInfo } = currentResume;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                    value={personalInfo.fullName} 
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    placeholder="e.g. John Doe"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                    value={personalInfo.email} 
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    placeholder="e.g. john@example.com"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input 
                    value={personalInfo.phone} 
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    placeholder="e.g. +1 234 567 890"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input 
                    value={personalInfo.address} 
                    onChange={(e) => updatePersonalInfo('address', e.target.value)}
                    placeholder="City, Country"
                />
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium">LinkedIn</label>
                <Input 
                    value={personalInfo.linkedin} 
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                />
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input 
                    value={personalInfo.website} 
                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                    placeholder="johndoe.com"
                />
            </div>
        </div>
    </div>
  );
};

export default PersonalForm;
