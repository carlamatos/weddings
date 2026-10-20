'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Opening an editor from a link: the setup checklist links to the page
// editor with ?open=<target> (app/lib/setup-progress.ts), and the editable
// element for that target opens its popup on arrival. The parameter is then
// removed, so the same link works again on a second click.
export type EditorTarget = 'location' | 'banner' | 'description' | 'gallery';

export const OPEN_PARAM = 'open';

// The search params object the last request was handled for: an element can
// appear twice on a page, and only the first one should open.
let handled: URLSearchParams | null = null;

export function useOpenEditor(target: EditorTarget, open: () => void) {
  const params = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (params.get(OPEN_PARAM) !== target || handled === params) return;
    handled = params;
    open();
    const rest = new URLSearchParams(params);
    rest.delete(OPEN_PARAM);
    const query = rest.toString();
    window.history.replaceState(window.history.state, '', query ? `${pathname}?${query}` : pathname);
    // `open` changes every render; only a new request should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, pathname, target]);
}
