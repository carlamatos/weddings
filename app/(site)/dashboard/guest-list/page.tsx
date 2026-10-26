import { redirectToDefaultPage } from '@/app/lib/dashboard';

// Short link: this screen for the user's page (or a page picker).
export default function Page() {
  return redirectToDefaultPage('/guest-list');
}
