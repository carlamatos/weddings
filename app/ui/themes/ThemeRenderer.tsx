import { getTheme } from './registry';
import type { ThemeProps } from './types';
import { RsvpOptionsProvider } from './rsvp-options';

interface ThemeRendererProps extends ThemeProps {
  themeSlug?: string;
  // Only guests on the guest list can RSVP (the form says so).
  rsvpGuestListOnly?: boolean;
}

export default function ThemeRenderer({ themeSlug, rsvpGuestListOnly = false, ...props }: ThemeRendererProps) {
  const { Page } = getTheme(themeSlug);
  return (
    <RsvpOptionsProvider guestListOnly={rsvpGuestListOnly}>
      <Page {...props} />
    </RsvpOptionsProvider>
  );
}
