import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

const SEOHead = ({ 
  title = 'CV Mate - AI Career Ecosystem', 
  description = 'Tạo CV chuẩn ATS trong 5 phút và luyện phỏng vấn với AI. Nền tảng All-in-one hỗ trợ sự nghiệp.',
  keywords = 'CV, Resume, ATS, Interview, AI, Career, Job Search',
  ogImage = '/logo.svg',
  ogUrl = window.location.href
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:url', ogUrl, 'property');
    updateMetaTag('og:type', 'website', 'property');
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
  }, [title, description, keywords, ogImage, ogUrl]);

  return null;
};

export default SEOHead;
