import { redirectToDefaultPage } from '@/app/lib/dashboard';

// Short link (used by the feature pages): this screen for the user's oldest page.
export default function Page() {
  return redirectToDefaultPage('/livestream');
}
