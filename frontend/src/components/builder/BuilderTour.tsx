import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, CircleCheckBig } from 'lucide-react';
import { useI18n } from '@/store/i18nStore';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tourSteps: TourStep[] = [
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    description:
      'Use this sidebar to navigate between different sections of your CV. Each section shows a completion status.',
    target: '[data-tour="sidebar"]',
    position: 'right',
  },
  {
    id: 'form',
    title: 'Edit Form',
    description:
      'Fill in your information here. Changes are saved automatically and reflected in the preview on the right.',
    target: '[data-tour="form"]',
    position: 'left',
  },
  {
    id: 'preview',
    title: 'Live Preview',
    description:
      'See how your CV looks in real-time. This is exactly how it will appear when you download it as PDF.',
    target: '[data-tour="preview"]',
    position: 'left',
  },
  {
    id: 'actions',
    title: 'Actions & Settings',
    description:
      'Access templates, AI tools, section management, and download options from the Settings button.',
    target: '[data-tour="actions"]',
    position: 'bottom',
  },
];

interface BuilderTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuilderTour = ({ isOpen, onClose }: BuilderTourProps) => {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    if (step) {
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          element.style.zIndex = '1000';
          element.style.position = 'relative';
        }, 300);
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.zIndex = '';
        targetElement.style.position = '';
      }
    };
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  if (!step) return null;

  const getPositionClasses = () => {
    switch (step.position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-4';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-4';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-4';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-4';
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[9998]" onClick={handleSkip} />
          {targetElement && (
            <div
              className="fixed z-[9999] pointer-events-none"
              style={{
                top: targetElement.offsetTop + targetElement.offsetHeight / 2,
                left: targetElement.offsetLeft + targetElement.offsetWidth / 2,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-crimson-red p-6 w-80 pointer-events-auto ${getPositionClasses()}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-crimson-red">
                        {currentStep + 1} / {tourSteps.length}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2 flex-shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex-1"
                  >
                    <ArrowLeft size={14} className="mr-1" />
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {tourSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentStep
                            ? 'bg-crimson-red'
                            : index < currentStep
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="flex-1 bg-crimson-red hover:bg-fire-red text-white"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        <CircleCheckBig size={14} className="mr-1" />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight size={14} className="ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default BuilderTour;
