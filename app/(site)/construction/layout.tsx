import type { Metadata } from 'next';

// The page itself is a client component, so its title is set here.
export const metadata: Metadata = { title: 'Coming soon', robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
