import Header from '@/components/dms/header';
import SidebarNav from '@/components/dms/sidebar-nav';
import { DmsProvider } from '@/context/dms-context';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DmsProvider>
      <SidebarProvider>
        <div className="grid h-screen w-full grid-cols-1 md:grid-cols-[260px_1fr]">
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="hidden flex-col border-r bg-card md:flex"
          >
            <SidebarNav />
          </Sidebar>
          <div className="flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DmsProvider>
  );
}
