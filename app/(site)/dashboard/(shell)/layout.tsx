import DashboardShell from '@/app/ui/dashboard/shell';

// Dashboard screens that aren't about one particular page (page list, setup).
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
