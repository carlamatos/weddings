import SideNav from '@/app/ui/dashboard/sidenav';
export const experimental_ppr = true;
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-0 md:overflow-y-auto md:p-0">{children}</div>
    </div>
  );
}