import { redirectToDefaultPage } from '@/app/lib/dashboard';

// Short link (used by the free planning tools): this screen for the user's oldest page.
export default function Page() {
  return redirectToDefaultPage('/timeline');
}
