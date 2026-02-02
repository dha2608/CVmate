import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/dashboard' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (index < pathSegments.length - 1) {
        breadcrumbs.push({ label, path: currentPath });
      } else {
        breadcrumbs.push({ label });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-sm", className)}>
      <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li
              key={index}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index === 0 ? (
                <Link
                  to={item.path || '#'}
                  className={cn(
                    "flex items-center gap-1",
                    isLast
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-crimson-red dark:hover:text-red-400"
                  )}
                  itemProp="item"
                >
                  <Home size={16} />
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <>
                  <ChevronRight size={16} className="text-gray-400" />
                  {item.path && !isLast ? (
                    <Link
                      to={item.path}
                      className="text-gray-600 dark:text-gray-300 hover:text-crimson-red dark:hover:text-red-400"
                      itemProp="item"
                    >
                      <span itemProp="name">{item.label}</span>
                    </Link>
                  ) : (
                    <span
                      className="text-gray-500 dark:text-gray-400 font-medium"
                      itemProp="name"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  )}
                </>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
