// The URL parameters that open a page editor popup on arrival
// (app/ui/themes/open-editor.ts). Kept apart from that client file so the
// server can build these links too (app/lib/actions.ts).
export const OPEN_PARAM = 'open';
// ?open=location&first=1: a brand-new page, straight from its creation, so
// the popup asks "When and where?" with "Skip for now".
export const FIRST_PARAM = 'first';
