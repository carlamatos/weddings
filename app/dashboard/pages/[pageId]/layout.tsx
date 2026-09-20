import DashboardShell from '@/app/ui/dashboard/shell';
import { parsePageId } from '@/app/lib/data';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  return <DashboardShell pageId={parsePageId(pageId)}>{children}</DashboardShell>;
}
