import '@/app/ui/dashboard.css';

// Shared by every dashboard route. The chrome itself lives in DashboardShell,
// which the (shell) and pages/[pageId] layouts render — the page id is only
// known to the layout of the [pageId] segment.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
