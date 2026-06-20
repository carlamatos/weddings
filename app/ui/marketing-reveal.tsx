'use client';
import { useEffect } from 'react';

export default function MarketingReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.marketing-page .reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
