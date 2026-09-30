import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DemoBadge from '@/components/common/DemoBadge';
import StaffDialog, { STAFF_ROLE_LABELS } from '@/components/staff/StaffDialog';
import { useStaff } from '@/hooks/useClinicData';

export default function StaffList() {
  const { data: staff = [], isLoading } = useStaff();
  const [dialog, setDialog] = useState({ open: false });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialog({ open: true })}><Plus className="mr-2 h-4 w-4" />Agregar personal</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {staff.map((s) => (
          <button key={s.id} onClick={() => setDialog({ open: true, member: s })} className="rounded-2xl border bg-card p-5 text-left transition hover:border-primary/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">{STAFF_ROLE_LABELS[s.role]}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{s.active !== false ? 'Activo' : 'Inactivo'}</span>
            </div>
            <p className="mt-2 flex items-center gap-2 font-semibold">{s.full_name} <DemoBadge show={s.is_demo} /></p>
            <p className="text-sm text-muted-foreground">{s.specialty || '—'}</p>
            <p className="mt-3 text-xs text-muted-foreground">{s.schedule || 'Horario no definido'}</p>
          </button>
        ))}
      </div>
      <StaffDialog open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} member={dialog.member} />
    </div>
  );
}