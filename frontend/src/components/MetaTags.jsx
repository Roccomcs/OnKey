import { useEffect } from 'react';

/**
 * Componente para gestionar meta tags dinámicamente
 * Uso: <MetaTags title="..." description="..." />
 */
export function MetaTags({
  title = 'onKey — Gestión de Propiedades',
  description = 'Plataforma digital para inmobiliarias: gestiona propiedades, contratos, inquilinos y propietarios en un solo lugar.',
  image = 'https://www.onkey.com.ar/og-image.jpg',
  url = 'https://www.onkey.com.ar',
  type = 'website',
  author = 'onKey',
  twitterHandle = '@onKeyAR',
}) {
  useEffect(() => {
    // Title tag
    document.title = title;

    // Meta description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Open Graph tags
    setOrCreateMetaTag('property', 'og:title', title);
    setOrCreateMetaTag('property', 'og:description', description);
    setOrCreateMetaTag('property', 'og:image', image);
    setOrCreateMetaTag('property', 'og:url', url);
    setOrCreateMetaTag('property', 'og:type', type);

    // Twitter Card tags
    setOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    setOrCreateMetaTag('name', 'twitter:title', title);
    setOrCreateMetaTag('name', 'twitter:description', description);
    setOrCreateMetaTag('name', 'twitter:image', image);
    setOrCreateMetaTag('name', 'twitter:site', twitterHandle);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Keywords meta (opcional)
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', 'inmobiliaria, propiedades, gestión, contratos, inquilinos');
    }

  }, [title, description, image, url, type, author, twitterHandle]);

  return null; // Este componente solo actualiza meta tags
}

/**
 * Helper para crear o actualizar meta tags
 */
function setOrCreateMetaTag(attrName, attrValue, content) {
  let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrName, attrValue);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

/**
 * Hook alternativo más simple para casos básicos
 */
export function useMetaTags({
  title = 'onKey',
  description = 'Gestión de propiedades para inmobiliarias',
  url = 'https://www.onkey.com.ar',
} = {}) {
  useEffect(() => {
    document.title = title;
    
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', description);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = url;
    }
  }, [title, description, url]);
}
