import SideNav from '@/app/ui/dashboard/sidenav';
import TopNav from '../ui/dashboard/topnav';
export const experimental_ppr = true;
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    
    <div className="flex h-screen flex-col md:overflow-hidden">
    <div className="sage"><TopNav /></div>

    <div className="flex flex-col md:flex-row md:overflow-hidden">
    
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-0 md:overflow-y-auto md:p-0">{children}</div>
    </div>
    </div>
  );
}