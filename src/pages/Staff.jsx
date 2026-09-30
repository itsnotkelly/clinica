import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import StaffList from '@/components/staff/StaffList';
import AccountsList from '@/components/staff/AccountsList';
import { useRole } from '@/hooks/useClinicData';
import { can } from '@/lib/constants';

export default function Staff() {
  const role = useRole();
  if (!can(role, 'admin')) return <p className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Solo los administradores pueden acceder a esta sección.</p>;

  return (
    <div>
      <PageHeader eyebrow="Administración" title="Personal y cuentas" subtitle="Gestione el equipo de la clínica y los permisos de acceso al sistema." />
      <Tabs defaultValue="personal">
        <TabsList className="bg-muted/70">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="cuentas">Cuentas y roles</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="mt-5"><StaffList /></TabsContent>
        <TabsContent value="cuentas" className="mt-5"><AccountsList /></TabsContent>
      </Tabs>
    </div>
  );
}