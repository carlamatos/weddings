'use client';

import { ERROR_TEXT, ErrorContent } from '@/app/ui/error-content';

// Something broke on an English page (the site, guests' event pages): Pop
// says oops, with Try again (app/ui/error-content.tsx). The dashboard has its own.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorContent error={error} retry={retry} t={ERROR_TEXT.en} homeHref="/" />;
}
