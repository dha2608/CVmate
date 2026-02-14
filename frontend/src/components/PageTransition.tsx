import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Simplified PageTransition - no animation to avoid blocking issues
const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
};

export default PageTransition;
