import type { Metadata } from 'next';
import { RootDocument, rootMetadata } from '@/app/ui/root-document';

// The root layout for the Spanish pages, so <html lang> matches their hreflang.
export const metadata: Metadata = rootMetadata;

export default function SpanishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="es">{children}</RootDocument>;
}
