'use client';

import { inter } from '@/app/ui/fonts';
import { ERROR_TEXT, ErrorContent } from '@/app/ui/error-content';

// The last resort, when even a root layout fails: it replaces the whole
// document, so it brings its own <html> and no site CSS (the screen's styles
// are inline). Pop says oops (app/ui/error-content.tsx). No metadata in a
// client file: the title is React's <title>.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0 }}>
        <title>Something went wrong | MyGala</title>
        <ErrorContent error={error} retry={retry} t={ERROR_TEXT.en} homeHref="/" />
      </body>
    </html>
  );
}
