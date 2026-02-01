import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Code, Briefcase, Globe, Users, Building2, GraduationCap } from 'lucide-react';
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

const PersonaSelector = ({ onSelect, isLoading }: { onSelect: (id: string) => void; isLoading: boolean }) => {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const personas: Persona[] = [
    {
      id: 'friendly-hr',
      title: t('interview.friendlyHR'),
      desc: t('interview.friendlyHRDesc'),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Annie&clothing=blazerAndShirt&eyes=happy',
      icon: Users,
      color: 'bg-blue-500',
      difficulty: 'Easy',
      category: 'hr'
    },
    {
      id: 'strict-manager',
      title: t('interview.strictManager'),
      desc: t('interview.strictManagerDesc'),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&clothing=collarAndSweater&eyebrows=angry&mouth=serious',
      icon: Briefcase,
      color: 'bg-red-500',
      difficulty: 'Hard',
      category: 'technical'
    },
    {
      id: 'english-native',
      title: t('interview.englishNative'),
      desc: t('interview.englishNativeDesc'),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&clothing=shirtCrewNeck&accessories=glasses',
      icon: Globe,
      color: 'bg-green-500',
      difficulty: 'Medium',
      category: 'language'
    },
    {
      id: 'tech-lead',
      title: 'Senior Tech Lead',
      desc: 'Deep technical interviews focusing on system design, architecture, and problem-solving. Expect challenging scenarios.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech&clothing=shirtCrewNeck&accessories=glasses&hair=short',
      icon: Code,
      color: 'bg-purple-500',
      difficulty: 'Hard',
      category: 'technical'
    },
    {
      id: 'startup-founder',
      title: 'Startup Founder',
      desc: 'Fast-paced, entrepreneurial mindset. Tests your ability to think on your feet and adapt to rapid changes.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Startup&clothing=hoodie&hair=short',
      icon: Sparkles,
      color: 'bg-yellow-500',
      difficulty: 'Medium',
      category: 'business'
    },
    {
      id: 'executive',
      title: 'C-Level Executive',
      desc: 'Strategic thinking and leadership questions. Focuses on vision, decision-making, and business impact.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Executive&clothing=blazerAndShirt&hair=short',
      icon: Building2,
      color: 'bg-indigo-500',
      difficulty: 'Hard',
      category: 'business'
    },
    {
      id: 'academic',
      title: 'Academic Researcher',
      desc: 'Theoretical knowledge and research methodology. Perfect for PhD candidates and research positions.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Academic&clothing=shirtCrewNeck&accessories=glasses',
      icon: GraduationCap,
      color: 'bg-teal-500',
      difficulty: 'Medium',
      category: 'academic'
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

  const filteredPersonas = selectedCategory === 'all' 
    ? personas 
    : personas.filter(p => p.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={selectedCategory === cat.id ? 'bg-crimson-red hover:bg-fire-red' : ''}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Persona Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonas.map(persona => {
          const Icon = persona.icon;
          return (
            <div
              key={persona.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:scale-105 transition-all group relative overflow-hidden"
              onClick={() => !isLoading && onSelect(persona.id)}
            >
              {/* Background gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${persona.color} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150`}></div>
              
              {/* Difficulty Badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(persona.difficulty)}`}>
                  {persona.difficulty}
                </span>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full ${persona.color} p-1 flex items-center justify-center`}>
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 overflow-hidden">
                    <img src={persona.avatar} alt={persona.title} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-crimson-red dark:group-hover:text-red-400 transition-colors">
                    {persona.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Icon className={`w-4 h-4 ${persona.color.replace('bg-', 'text-')}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{persona.category}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {persona.desc}
              </p>

              {/* Start Button */}
              <Button
                className={`w-full ${persona.color} hover:opacity-90 text-white`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Interview
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
