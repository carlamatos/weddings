'use client';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { ErrorContent } from '@/app/ui/error-content';

// Something broke on a dashboard screen: Pop says oops in the dashboard's
// language, inside the dashboard (its sidebar and top bar stay). Used by the
// error.tsx of the (shell) and pages/[pageId] dashboard routes, which sit
// inside DashboardShell's text.
export function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  const d = useDashText();
  return <ErrorContent error={error} retry={retry} t={d.errorScreen} homeHref="/dashboard" compact />;
}
