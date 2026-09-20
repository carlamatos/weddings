// Dates are shown in UTC so they match what Stripe reports regardless of
// where the server runs.
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${formatDate(d)} ${d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`;
}
