import { useState, useEffect } from 'react';

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook để disable animations nếu user prefers reduced motion
export const useAnimationConfig = () => {
  const prefersReducedMotion = useReducedMotion();

  return {
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    animate: prefersReducedMotion ? {} : undefined,
    initial: prefersReducedMotion ? {} : undefined,
  };
};
