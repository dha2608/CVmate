import { useState } from 'react';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import type { BuilderSection, BuilderSectionId } from './BuilderSidebar';

interface SectionReorderProps {
  sections: BuilderSection[];
  onReorder: (sections: BuilderSection[]) => void;
  onToggleVisibility: (id: BuilderSectionId) => void;
}

const SectionReorder = ({ sections, onReorder, onToggleVisibility }: SectionReorderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 lg:px-3 py-1.5 sm:py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-crimson-red hover:text-crimson-red transition-all duration-200 flex-shrink-0 whitespace-nowrap"
      >
        <GripVertical size={14} className="sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Sections</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[45]" 
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-[50] p-4"
          >
            <h3 className="font-bold text-gray-900 mb-3">Reorder Sections</h3>
            <Reorder.Group
              axis="y"
              values={sections}
              onReorder={onReorder}
              className="space-y-2"
            >
              {sections.map((section) => (
                <Reorder.Item
                  key={section.id}
                  value={section}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-grab active:cursor-grabbing"
                  whileDrag={{ scale: 1.05, opacity: 0.8 }}
                >
                  <GripVertical size={16} className="text-gray-400" />
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {section.label}
                  </span>
                  <button
                    onClick={() => onToggleVisibility(section.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {section.visible ? (
                      <Eye size={16} className="text-gray-600" />
                    ) : (
                      <EyeOff size={16} className="text-gray-400" />
                    )}
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default SectionReorder;
