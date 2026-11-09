import type { Metadata } from 'next';
import '@/app/ui/dashboard.css';

// Each screen sets its own title ("Dashboard: Guest List | MyGala") — never
// the event's name, which would reach analytics.
export const metadata: Metadata = {
  title: { template: 'Dashboard: %s | MyGala', default: 'Dashboard' },
  robots: { index: false, follow: false },
};

// Shared by every dashboard route. The chrome itself lives in DashboardShell,
// which the (shell) and pages/[pageId] layouts render — the page id is only
// known to the layout of the [pageId] segment.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
