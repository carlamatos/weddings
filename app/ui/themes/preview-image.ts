import type { ImgHTMLAttributes } from 'react';
import { getImageProps } from 'next/image';

// <img> props for a theme preview card's background. The themes' own photos
// in /images are multi-megabyte originals, so they go through Next's image
// optimizer: a WebP sized to the card, loaded only when it scrolls into view.
// Anything else (an uploaded banner, a blob: preview of a file being picked,
// an SVG) is used as is. `eager` is for images visible on arrival (they can
// be the page's LCP), `priority` for the few that should come first.
export function previewImage(
  src: string,
  sizes = '(max-width: 700px) 100vw, 600px',
  { eager = false, priority = false }: { eager?: boolean; priority?: boolean } = {},
): ImgHTMLAttributes<HTMLImageElement> {
  const load: ImgHTMLAttributes<HTMLImageElement> = {
    loading: eager || priority ? 'eager' : 'lazy',
    decoding: 'async',
    ...(priority ? { fetchPriority: 'high' as const } : {}),
  };
  if (!src.startsWith('/images/') || src.endsWith('.svg')) return { src, ...load };
  const { props } = getImageProps({
    src,
    alt: '',
    width: 1200,
    height: 600,
    // Cards are full width on phones and at most ~600px wide on desktop.
    sizes,
    quality: 75,
  });
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes, ...load };
}
