import { ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function PendingRole() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
          <ShieldAlert className="h-7 w-7 text-accent-foreground" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          Cuenta pendiente de autorización
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Su usuario ha sido registrado, pero aún no tiene permiso para acceder al sistema.
          Un administrador de la clínica debe autorizar su cuenta antes de que pueda ver
          cualquier información de pacientes, citas o finanzas.
        </p>
        <div className="mt-6 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
          Espere a que la administración active su acceso. Si su cuenta ya fue autorizada,
          cierre sesión y vuelva a iniciarla.
        </div>
        <Button variant="outline" className="mt-6 w-full" onClick={() => base44.auth.logout('/login')}>
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}