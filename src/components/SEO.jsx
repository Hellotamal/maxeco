import { useEffect } from 'react';
import { siteConfig } from '../data/siteContent';

/**
 * Dynamic Document Head Manager for SEO, Canonical links, and Structured Data
 */
export default function SEO({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  schemaData = null
}) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title 
      ? `${title} | ${siteConfig.name}` 
      : `${siteConfig.name} | ${siteConfig.tagline}`;
    document.title = fullTitle;

    // 2. Helper to set or create meta tag
    const setMeta = (attr, key, content) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content || '');
    };

    const pageDesc = description || siteConfig.description;
    const pageUrl = `${siteConfig.canonicalUrl}${canonicalPath}`;

    setMeta('name', 'description', pageDesc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', pageDesc);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', siteConfig.name);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', pageDesc);

    // 3. Update Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    // 4. Inject Schema JSON-LD if provided
    let scriptTag = document.getElementById('seo-json-ld');
    if (schemaData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seo-json-ld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schemaData);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, canonicalPath, ogType, schemaData]);

  return null;
}
