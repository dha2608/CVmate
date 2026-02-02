import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const ProgressIndicator = ({
  steps,
  currentStep,
  className,
  orientation = 'horizontal'
}: ProgressIndicatorProps) => {
  if (orientation === 'vertical') {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isCompleted && "bg-crimson-red border-crimson-red text-white",
                    isCurrent && "bg-white border-crimson-red text-crimson-red",
                    isUpcoming && "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 mt-2",
                      isCompleted ? "bg-crimson-red" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-8">
                <h3
                  className={cn(
                    "font-semibold mb-1",
                    isCurrent && "text-crimson-red",
                    isCompleted && "text-gray-900 dark:text-white",
                    isUpcoming && "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {step.label}
                </h3>
                {step.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors relative z-10",
                    isCompleted && "bg-crimson-red border-crimson-red text-white",
                    isCurrent && "bg-white border-crimson-red text-crimson-red shadow-lg",
                    isUpcoming && "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isCurrent && "text-crimson-red",
                      isCompleted && "text-gray-900 dark:text-white",
                      isUpcoming && "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 -mt-5 relative z-0",
                    isCompleted ? "bg-crimson-red" : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
