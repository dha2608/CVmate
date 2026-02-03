import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

const defaultSkipLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' },
];

export const SkipLinks = ({ links = defaultSkipLinks }: { links?: SkipLink[] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip links when Tab is pressed
      if (e.key === 'Tab' && !isVisible) {
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      // Hide skip links after a short delay when clicking
      setTimeout(() => setIsVisible(false), 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [isVisible]);

  // Reset visibility on route change
  useEffect(() => {
    setIsVisible(false);
  }, [location.pathname]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-[100] focus-within:top-4 focus-within:left-4">
      <nav aria-label="Skip links">
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={cn(
                  "inline-block px-4 py-2",
                  "bg-crimson-red text-white rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-crimson-red focus:ring-offset-2",
                  "hover:bg-fire-red transition-colors"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector(link.href);
                  if (element) {
                    (element as HTMLElement).focus();
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
