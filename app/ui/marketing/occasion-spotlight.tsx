import type { OccasionSpotlightData } from '@/app/lib/marketing/occasion-spotlight';
import { getImageProps } from 'next/image';
import '@/app/ui/marketing/occasion-spotlight.css';

// A band pointing to one occasion's page (New Year's Eve): its photo with the
// words and a button over it. On the home page and /party-celebrations.
// One small version of the photo for every screen (about 50 KB): it sits
// under a dark wash, so a sharper one for wide or high-resolution screens
// would only add weight, near the top of the home page.
function bandPhoto(src: string): string {
  // Next serves the 2x copy as src: 414 wide gives the 828px one.
  return getImageProps({ src, alt: '', width: 414, height: 192, quality: 75 }).props.src;
}

export function OccasionSpotlight({ spotlight, cta }: { spotlight: OccasionSpotlightData; cta: string }) {
  return (
    <section className="ilp-spotlight">
      <a href={spotlight.href} className="ilp-spotlight-card" data-cta={cta}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bandPhoto(spotlight.image)} alt="" className="ilp-spotlight-img" loading="lazy" decoding="async" fetchPriority="low" />
        <span className="ilp-spotlight-body">
          <span className="ilp-spotlight-eyebrow">{spotlight.eyebrow}</span>
          <strong className="ilp-spotlight-title">{spotlight.title}</strong>
          <span className="ilp-spotlight-text">{spotlight.text}</span>
          <span className="ilp-spotlight-link">{spotlight.label} →</span>
        </span>
      </a>
    </section>
  );
}
