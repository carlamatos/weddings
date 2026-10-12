'use client';

import { useEffect } from 'react';

// A theme preview card's display font, added after the page has loaded. As
// a plain <link rel="stylesheet"> it was fetched at top priority by every
// page showing the card (e.g. the homepage), competing with the first screen
// for fonts only needed further down. Until it arrives the card shows its
// fallback font.
export default function PreviewFont({ href }: { href: string }) {
  useEffect(() => {
    if (document.querySelector(`link[rel="stylesheet"][href="${CSS.escape(href)}"]`)) return;
    const add = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };
    if (document.readyState === 'complete') add();
    else window.addEventListener('load', add, { once: true });
    return () => window.removeEventListener('load', add);
  }, [href]);
  return null;
}
