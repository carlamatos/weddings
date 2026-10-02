import { greatVibes } from '@/app/ui/fonts';
import { auth } from '@/auth';
import SiteTopbar from '@/app/ui/site-topbar';
import SiteFooter from './site-footer';
import '@/app/ui/marketing.css';

// Top bar + footer around the marketing content pages (features, event
// types, FAQ).
export default async function MarketingShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className={`marketing-page ${greatVibes.variable}`}>
      <SiteTopbar isLoggedIn={!!session?.user} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
