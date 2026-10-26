import type { Metadata } from 'next';
import { RootDocument, rootMetadata } from '@/app/ui/root-document';

// The root layout for every English page (the French ones have app/fr/layout.tsx).
export const metadata: Metadata = rootMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
