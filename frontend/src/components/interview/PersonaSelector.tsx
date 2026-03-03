import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Zap,
  Code,
  Briefcase,
  Globe,
  Users,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { useI18n } from '@/store/i18nStore';

interface Persona {
  id: string;
  title: string;
  desc: string;
  avatar: string;
  icon: any;
  color: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

const PersonaSelector = ({
  onSelect,
  isLoading,
}: {
  onSelect: (id: string) => void;
  isLoading: boolean;
}) => {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imgOk, setImgOk] = useState<Record<string, boolean>>({});

  // Generate consistent avatars using initials-based approach
  const getPersonaInitials = (id: string) => {
    const initials: Record<string, string> = {
      'friendly-hr': 'HR',
      'strict-manager': 'SM',
      'english-native': 'EN',
      'tech-lead': 'TL',
      'startup-founder': 'SF',
      executive: 'EX',
      academic: 'AC',
    };
    return initials[id] || 'AI';
  };

  const personas: Persona[] = [
    {
      id: 'friendly-hr',
      title: t('interview.friendlyHR'),
      desc: t('interview.friendlyHRDesc'),
      avatar: '', // Will use icon fallback
      icon: Users,
      color: 'bg-blue-500',
      difficulty: 'Easy',
      category: 'hr',
    },
    {
      id: 'strict-manager',
      title: t('interview.strictManager'),
      desc: t('interview.strictManagerDesc'),
      avatar: '', // Will use icon fallback
      icon: Briefcase,
      color: 'bg-red-500',
      difficulty: 'Hard',
      category: 'technical',
    },
    {
      id: 'english-native',
      title: t('interview.englishNative'),
      desc: t('interview.englishNativeDesc'),
      avatar: '', // Will use icon fallback
      icon: Globe,
      color: 'bg-green-500',
      difficulty: 'Medium',
      category: 'language',
    },
    {
      id: 'tech-lead',
      title: t('interview.techLead'),
      desc: t('interview.techLeadDesc'),
      avatar: '', // Will use icon fallback
      icon: Code,
      color: 'bg-purple-500',
      difficulty: 'Hard',
      category: 'technical',
    },
    {
      id: 'startup-founder',
      title: t('interview.startupFounder'),
      desc: t('interview.startupFounderDesc'),
      avatar: '', // Will use icon fallback
      icon: Zap,
      color: 'bg-yellow-500',
      difficulty: 'Medium',
      category: 'business',
    },
    {
      id: 'executive',
      title: t('interview.executive'),
      desc: t('interview.executiveDesc'),
      avatar: '', // Will use icon fallback
      icon: Building2,
      color: 'bg-indigo-500',
      difficulty: 'Hard',
      category: 'business',
    },
    {
      id: 'academic',
      title: t('interview.academic'),
      desc: t('interview.academicDesc'),
      avatar: '', // Will use icon fallback
      icon: GraduationCap,
      color: 'bg-teal-500',
      difficulty: 'Medium',
      category: 'academic',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Personas' },
    { id: 'hr', label: 'HR & Culture' },
    { id: 'technical', label: 'Technical' },
    { id: 'business', label: 'Business' },
    { id: 'language', label: 'Language' },
    { id: 'academic', label: 'Academic' },
  ];

  const filteredPersonas =
    selectedCategory === 'all' ? personas : personas.filter((p) => p.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 justify-center px-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-xs sm:text-sm ${selectedCategory === cat.id ? 'bg-crimson-red hover:bg-fire-red text-white' : 'dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Persona Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredPersonas.map((persona) => {
          const Icon = persona.icon;
          const ok = imgOk[persona.id] !== false;
          return (
            <div
              key={persona.id}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group relative overflow-hidden flex flex-col min-h-[248px]"
              onClick={() => !isLoading && onSelect(persona.id)}
            >
              {/* Background gradient */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 ${persona.color} opacity-10 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 transition-transform group-hover:scale-150`}
              ></div>

              {/* Difficulty Badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <span
                  className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getDifficultyColor(persona.difficulty)}`}
                >
                  {persona.difficulty}
                </span>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${persona.color} p-0.5 sm:p-1 flex items-center justify-center flex-shrink-0 shadow-md`}
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                    {persona.avatar && ok ? (
                      <img
                        src={persona.avatar}
                        alt={persona.title}
                        className="w-full h-full object-cover"
                        onError={() => setImgOk((m) => ({ ...m, [persona.id]: false }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon
                          className={`w-6 h-6 sm:w-7 sm:h-7 ${persona.color.replace('bg-', 'text-')}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-crimson-red dark:group-hover:text-red-400 transition-colors truncate">
                    {persona.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Icon
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${persona.color.replace('bg-', 'text-')}`}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {persona.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-3">
                {persona.desc}
              </p>

              {/* Start Button */}
              <Button
                className={`w-full ${persona.color} hover:opacity-90 text-white text-xs sm:text-sm mt-auto`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t('interview.startInterview')}
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonaSelector;
