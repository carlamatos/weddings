'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Opening an editor from a link: the setup checklist links to the page
// editor with ?open=<target> (app/lib/setup-progress.ts), and the editable
// element for that target opens its popup on arrival. The parameter is then
// removed, so the same link works again on a second click.
export type EditorTarget = 'location' | 'banner' | 'description' | 'gallery';

import { FIRST_PARAM, OPEN_PARAM } from './open-editor-params';
export { FIRST_PARAM, OPEN_PARAM };

// The search params object the last request was handled for: an element can
// appear twice on a page, and only the first one should open.
let handled: URLSearchParams | null = null;

export function useOpenEditor(target: EditorTarget, open: (first: boolean) => void) {
  const params = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (params.get(OPEN_PARAM) !== target || handled === params) return;
    handled = params;
    open(params.get(FIRST_PARAM) === '1');
    const rest = new URLSearchParams(params);
    rest.delete(OPEN_PARAM);
    rest.delete(FIRST_PARAM);
    const query = rest.toString();
    // null, not the current history state: Next.js only picks up a
    // replaceState it didn't make itself, and it has to, or it keeps the old
    // ?open= and reopens the popup when the page re-renders (a theme switch).
    window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname);
    // `open` changes every render; only a new request should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, pathname, target]);
}
