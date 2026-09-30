import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from '@/components/common/StatusBadge';
import PriorityBadge from '@/components/common/PriorityBadge';

export default function AppointmentsTab({ appts, onOpen }) {
  const sorted = [...appts].sort((a, b) => (b.date + b.start_time).localeCompare(a.date + a.start_time));
  const summary = [
    ['Citas', appts.length],
    ['Atendidas', appts.filter((a) => a.status === 'completada').length],
    ['Canceladas', appts.filter((a) => a.status === 'cancelada').length],
    ['No presentadas', appts.filter((a) => a.status === 'no_show').length],
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map(([l, v]) => (
          <div key={l} className="rounded-xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="text-xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-card">
        {sorted.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Este paciente aún no tiene citas.</p>}
        <ul className="divide-y">
          {sorted.map((a) => (
            <li key={a.id} onClick={() => onOpen(a)} className="flex cursor-pointer items-center gap-4 px-5 py-3.5 hover:bg-muted/50">
              <div className="w-28 shrink-0">
                <p className="text-sm font-medium">{format(parseISO(a.date), 'd MMM yyyy', { locale: es })}</p>
                <p className="text-xs text-muted-foreground">{a.start_time} · {a.duration_minutes} min</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium">{a.reason || 'Sin motivo'} <PriorityBadge priority={a.priority} /></p>
                <p className="text-xs text-muted-foreground">{a.dentist_name}{a.rescheduled_count ? ` · Reprogramada ${a.rescheduled_count}×` : ''}</p>
              </div>
              <StatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}