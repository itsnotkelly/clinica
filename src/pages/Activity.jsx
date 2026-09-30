import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/common/PageHeader';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/hooks/useClinicData';
import { can, normalize } from '@/lib/constants';

export default function Activity() {
  const role = useRole();
  const [q, setQ] = useState('');
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit'], enabled: can(role, 'admin'),
    queryFn: () => base44.entities.AuditLog.list('-created_date', 500),
  });
  if (!can(role, 'admin')) return <p className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Solo los administradores pueden ver el registro de actividad.</p>;

  const n = normalize(q);
  const rows = logs.filter((l) => !n || [l.action, l.description, l.user_name, l.user_email].some((x) => normalize(x).includes(n)));

  return (
    <div>
      <PageHeader eyebrow="Auditoría" title="Registro de actividad" subtitle="Los registros no pueden ser editados ni eliminados." />
      <Input className="mb-4 max-w-sm bg-card" placeholder="Filtrar por usuario, acción o detalle" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Fecha y hora</th>
              <th className="px-5 py-3 font-medium">Usuario</th>
              <th className="px-5 py-3 font-medium">Acción</th>
              <th className="px-5 py-3 font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={4} className="p-5 text-muted-foreground">Cargando…</td></tr>}
            {rows.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap px-5 py-3 tabular-nums text-muted-foreground">{format(new Date(l.created_date), 'dd/MM/yyyy HH:mm')}</td>
                <td className="px-5 py-3">{l.user_name}</td>
                <td className="px-5 py-3 font-medium">{l.action}</td>
                <td className="px-5 py-3 text-muted-foreground">{l.description}</td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sin registros.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}