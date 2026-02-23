import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  sizes?: string;
  srcSet?: string;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  quality = 85,
  sizes,
  srcSet
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Try to get higher quality image if available
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) {return '';}
    
    // If it's an external URL, try to use image optimization services
    if (originalSrc.startsWith('http')) {
      // You can integrate with image CDN services here
      // For now, return original with better loading
      return originalSrc;
    }
    
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);

  // Generate srcSet for responsive images if not provided
  const generateSrcSet = (src: string) => {
    if (srcSet) {return srcSet;}
    // For local images, you might want to generate different sizes
    // This is a placeholder - implement based on your image service
    return undefined;
  };

  return (
    <div className="relative overflow-hidden w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center z-10">
          <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
      ) : (
        <motion.img
          src={optimizedSrc}
          alt={alt}
          loading={loading}
          className={className}
          srcSet={generateSrcSet(optimizedSrc)}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          decoding="async"
          fetchpriority={loading === 'eager' ? 'high' : 'low'}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
