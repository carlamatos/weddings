import SideNav from '@/app/ui/dashboard/sidenav';
import TopNav from '@/app/ui/dashboard/topnav';
import { greatVibes } from '@/app/ui/fonts';
import '@/app/ui/dashboard.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`dash dash-shell ${greatVibes.variable}`}>
      <SideNav />
      <div className="dash-main">
        <TopNav />
        <div className="dash-content">
          {children}
        </div>
      </div>
    </div>
  );
}
