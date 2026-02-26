import { memo, useCallback, useMemo } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Linkedin, Globe, HelpCircle } from 'lucide-react';
import { validateEmail, validateUrl } from '@/utils/validation';

interface FieldConfig {
  key: 'fullName' | 'email' | 'phone' | 'address' | 'linkedin' | 'website';
  label: string;
  icon: typeof User;
  placeholder: string;
  required: boolean;
  help?: string;
}

interface PersonalFieldProps {
  field: FieldConfig;
  value: string;
  onChange: (key: FieldConfig['key'], value: string) => void;
}

const PersonalField = memo(function PersonalField({ field, value, onChange }: PersonalFieldProps) {
  const Icon = field.icon;
  const isEmpty = !value.trim();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Icon size={14} className="text-gray-400" />
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.help && (
          <div className="group relative">
            <HelpCircle size={14} className="text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
              {field.help}
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        )}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        type={field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : 'text'}
        className={isEmpty && field.required ? 'border-amber-300 focus:border-amber-500' : 'border-gray-200'}
      />
      {isEmpty && field.required && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <span>⚠</span>
          <span>This field is required</span>
        </p>
      )}
      {field.key === 'email' && value && !validateEmail(value) && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span>⚠</span>
          <span>Please enter a valid email address</span>
        </p>
      )}
      {(field.key === 'linkedin' || field.key === 'website') && value && !validateUrl(value) && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <span>ℹ</span>
          <span>URL should start with http:// or https://</span>
        </p>
      )}
    </div>
  );
});

const PersonalForm = () => {
  const personalInfo = useResumeStore((s) => s.currentResume.personalInfo);

  const fields: FieldConfig[] = useMemo(
    () => [
      {
        key: 'fullName',
        label: 'Full Name',
        icon: User,
        placeholder: 'e.g. John Doe',
        required: true,
        help: 'Your full name as it should appear on your CV',
      },
      {
        key: 'email',
        label: 'Email',
        icon: Mail,
        placeholder: 'e.g. john@example.com',
        required: true,
        help: 'Professional email address',
      },
      {
        key: 'phone',
        label: 'Phone',
        icon: Phone,
        placeholder: 'e.g. +1 234 567 890',
        required: false,
        help: 'Include country code for international applications',
      },
      {
        key: 'address',
        label: 'Location',
        icon: MapPin,
        placeholder: 'City, Country',
        required: false,
        help: 'City and country where you are based',
      },
      {
        key: 'linkedin',
        label: 'LinkedIn',
        icon: Linkedin,
        placeholder: 'linkedin.com/in/johndoe',
        required: false,
        help: 'Your LinkedIn profile URL',
      },
      {
        key: 'website',
        label: 'Website/Portfolio',
        icon: Globe,
        placeholder: 'johndoe.com',
        required: false,
        help: 'Your personal website or portfolio URL',
      },
    ],
    []
  );

  const handleChange = useCallback((key: FieldConfig['key'], rawValue: string) => {
    let val = rawValue;
    if ((key === 'linkedin' || key === 'website') && val && !val.startsWith('http')) {
      if (!val.startsWith('//')) {
        val = `https://${val}`;
      }
    }
    useResumeStore.getState().updatePersonalInfo(key, val);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 mb-1">Personal Information</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Start by filling in your basic contact information. This will appear at the top of your CV.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field) => (
            <PersonalField
              key={field.key}
              field={field}
              value={personalInfo[field.key] || ''}
              onChange={handleChange}
            />
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  personalInfo.fullName && personalInfo.email ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <span className="text-xs text-gray-600">
                {personalInfo.fullName && personalInfo.email
                  ? '✓ Basic information complete'
                  : 'Fill in at least name and email to continue'}
              </span>
            </div>
            {personalInfo.fullName && personalInfo.email && (
              <button
                onClick={() => {
                  const nextSection = document.querySelector('[data-section="summary"]');
                  nextSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs text-crimson-red hover:text-fire-red font-medium"
              >
                Next: Summary →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PersonalForm);
