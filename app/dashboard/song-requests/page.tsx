import { redirectToDefaultPage } from '@/app/lib/dashboard';

// Old URL: forwards to this screen for the user's oldest page.
export default function Page() {
  return redirectToDefaultPage('/song-requests');
}
