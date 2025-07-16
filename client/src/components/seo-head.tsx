import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
}

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  keywords
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | TerraNav Solutions`;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Basic SEO meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:site_name', 'TerraNav Solutions', true);
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
    }
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage);
    }
    
    // Canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }
  }, [title, description, canonical, ogImage, ogType, keywords]);

  return null;
}