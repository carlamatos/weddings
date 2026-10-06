// Shared shapes for the marketing content pages (features, event types, FAQ).

export type Faq = { q: string; a: string };

// One "how to" step. `dashboard` is an app path (e.g. /dashboard/livestream)
// rendered as a link to that screen on the app subdomain.
export type Step = { title: string; text: string; dashboard?: string; linkLabel?: string };

// A titled block of body copy: paragraphs and/or bullet points.
export type ContentBlock = { heading: string; paragraphs?: string[]; bullets?: string[] };

export type SeoMeta = {
  title: string; // <title>, without the "| MyGala" suffix
  description: string; // meta description, ~150–160 characters
  keywords?: string[];
};
