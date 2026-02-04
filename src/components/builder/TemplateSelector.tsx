import { useState } from 'react';
import { Check, Wand2, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/store/i18nStore';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal';
  color: string;
}

const templates: Template[] = [
  {
    id: 'modern-red',
    name: 'Modern Red',
    description: 'Professional với accent màu đỏ',
    preview: 'bg-gradient-to-br from-red-50 to-red-100',
    category: 'modern',
    color: 'bg-red-500'
  },
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    description: 'Truyền thống và chuyên nghiệp',
    preview: 'bg-gradient-to-br from-blue-50 to-blue-100',
    category: 'classic',
    color: 'bg-blue-500'
  },
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    description: 'Tối giản và thanh lịch',
    preview: 'bg-gradient-to-br from-gray-50 to-gray-100',
    category: 'minimal',
    color: 'bg-gray-900'
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    description: 'Sáng tạo và nổi bật',
    preview: 'bg-gradient-to-br from-purple-50 to-purple-100',
    category: 'creative',
    color: 'bg-purple-500'
  },
  {
    id: 'ats-minimal',
    name: 'ATS Minimal',
    description: 'Tối ưu cho ATS, ít màu, bố cục rõ ràng',
    preview: 'bg-gradient-to-br from-gray-50 to-gray-100',
    category: 'minimal',
    color: 'bg-green-600'
  },
  {
    id: 'sidebar-accent',
    name: 'Sidebar Accent',
    description: 'Thông tin cá nhân bên trái, nội dung chính bên phải',
    preview: 'bg-gradient-to-r from-gray-800 to-gray-600',
    category: 'modern',
    color: 'bg-gray-900'
  },
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

const TemplateSelector = ({ selectedTemplate, onSelect }: TemplateSelectorProps) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | Template['category']>('all');

  const filteredTemplates = filter === 'all' 
    ? templates 
    : templates.filter(t => t.category === filter);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 lg:px-3 py-1.5 sm:py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-crimson-red hover:text-crimson-red transition-all duration-200 flex-shrink-0 whitespace-nowrap"
      >
        <Palette size={14} className="sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Template</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[45]" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-96 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-[50] p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Wand2 size={18} className="text-crimson-red" />
                  Choose Template
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Filter */}
              <div className="flex gap-2 mb-4">
                {(['all', 'modern', 'classic', 'minimal', 'creative'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat === 'all' ? 'all' : cat)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                      filter === (cat === 'all' ? 'all' : cat)
                        ? 'bg-crimson-red text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => {
                      onSelect(template.id);
                      setIsOpen(false);
                    }}
                    className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                      selectedTemplate === template.id
                        ? 'border-crimson-red bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-crimson-red rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <div className={`w-full h-20 rounded mb-2 ${template.preview} flex items-center justify-center`}>
                      <div className={`w-12 h-12 ${template.color} rounded-lg shadow-md`} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">{template.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateSelector;
