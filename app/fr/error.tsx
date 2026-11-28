'use client';

import { ERROR_TEXT, ErrorContent } from '@/app/ui/error-content';

// Something broke on a French page: Pop says oops, in French (app/ui/error-content.tsx).
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorContent error={error} retry={retry} t={ERROR_TEXT.fr} homeHref="/fr" />;
}
