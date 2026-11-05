// Shared shapes for the marketing content pages (features, event types, FAQ).

export type Faq = { q: string; a: string };

// One "how to" step. `dashboard` is an app path (e.g. /dashboard/livestream)
// rendered as a link to that screen on the app subdomain.
export type Step = { title: string; text: string; dashboard?: string; linkLabel?: string };

// A titled block of body copy: paragraphs and/or bullet points.
export type ContentBlock = { heading: string; paragraphs?: string[]; bullets?: string[] };

export type SeoMeta = {
  title: string; // <title>, without the "| MyGala" suffix (added unless it already names MyGala)
  description: string; // meta description, ~150–160 characters
  keywords?: string[];
};

// A product screenshot shown on a page (click to enlarge). src is under public/.
export type Screenshot = { src: string; alt: string; caption: string; width: number; height: number };

// A short explainer video shown on a page. src and poster are under public/;
// duration is ISO 8601 (PT34S) and uploadDate YYYY-MM-DD (videoObjectJsonLd
// adds the time and time zone), for search engines.
export type Video = {
  src: string;
  poster: string;
  title: string;
  description: string;
  caption: string;
  width: number;
  height: number;
  duration: string;
  uploadDate: string;
};
