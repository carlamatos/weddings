import type { Metadata } from 'next';
import { RootDocument, rootMetadata } from '@/app/ui/root-document';

// Pages shown only inside another page (app/(frame)/theme-preview): no
// tracking, and kept out of search results.
export const metadata: Metadata = { ...rootMetadata, robots: { index: false, follow: false } };

export default function FrameLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en" tags={false}>{children}</RootDocument>;
}
