import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import PendingRole from '@/components/layout/PendingRole';
import { useRole } from '@/hooks/useClinicData';
import { STAFF_ROLES } from '@/lib/constants';

export default function AppLayout() {
  const role = useRole();
  const [open, setOpen] = useState(false);

  if (!STAFF_ROLES.includes(role)) {
    return <PendingRole />;
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-64">
        <TopBar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}