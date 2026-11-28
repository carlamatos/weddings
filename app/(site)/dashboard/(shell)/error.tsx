'use client';

import { DashboardError } from '@/app/ui/dashboard/dashboard-error';

// A dashboard screen that broke: Pop says oops, in the dashboard's language.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <DashboardError error={error} retry={retry} />;
}
