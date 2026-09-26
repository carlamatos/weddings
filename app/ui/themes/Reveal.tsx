'use client';

import { useEffect, useRef, useState } from 'react';

// Ports the scroll-reveal IntersectionObserver pattern already proven in the
// static public/themes/*.html mockups into a reusable React wrapper — the
// live theme components never had this, they only faded in the hero on
// mount. Fires once per element, and is a no-op under prefers-reduced-motion.
export function Reveal({
  children,
  delay = 0,
  from = 'up',
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: 0 | 1 | 2 | 3;
  from?: 'up' | 'right';
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayMs = delay * 90;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0, 0)' : from === 'right' ? 'translateX(16px)' : 'translateY(18px)',
        transition: `opacity 0.75s ease ${delayMs}ms, transform 0.75s ease ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
