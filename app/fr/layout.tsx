import type { Metadata } from 'next';
import { RootDocument, rootMetadata } from '@/app/ui/root-document';

// The root layout for the French pages, so <html lang> matches their hreflang.
export const metadata: Metadata = rootMetadata;

export default function FrenchRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="fr-CA">{children}</RootDocument>;
}
