import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PriorityBadge from '@/components/common/PriorityBadge';
import StatusBadge from '@/components/common/StatusBadge';

const NEXT = {
  programada: [{ status: 'esperando', label: 'Marcar llegada' }, { status: 'no_show', label: 'No se presentó', variant: 'ghost' }],
  llego: [{ status: 'esperando', label: 'A sala de espera' }],
  esperando: [{ status: 'en_consulta', label: 'Pasar a consulta' }],
  en_consulta: [{ status: 'completada', label: 'Finalizar atención' }],
};

const mins = (from, now) => Math.max(0, Math.round((now - new Date(from).getTime()) / 60000));

export default function WaitingCard({ appt: a, now, onStatus, busy, onPay }) {
  const waiting = ['llego', 'esperando'].includes(a.status) && a.arrival_time;
  const inConsult = a.status === 'en_consulta' && a.consult_start_time;
  const arrival = a.arrival_time ? new Date(a.arrival_time).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className={`rounded-xl border bg-card p-4 ${a.priority === 'urgente' ? 'border-rose-300 ring-1 ring-rose-100' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold tabular-nums text-muted-foreground">{a.start_time}</p>
          <Link to={`/pacientes/${a.patient_id}`} className="block truncate font-medium hover:text-primary">{a.patient_name}</Link>
          <p className="truncate text-xs text-muted-foreground">{a.reason} · {a.dentist_name}</p>
        </div>
        <PriorityBadge priority={a.priority} />
      </div>
      {(waiting || inConsult || arrival) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          {arrival && <span className="text-muted-foreground">Llegó {arrival}</span>}
          {waiting && <span className={`font-semibold ${mins(a.arrival_time, now) > 20 ? 'text-rose-600' : 'text-amber-700'}`}>· {mins(a.arrival_time, now)} min esperando</span>}
          {inConsult && <span className="font-semibold text-sky-700">· {mins(a.consult_start_time, now)} min en consulta</span>}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(NEXT[a.status] || []).map((n) => (
          <Button key={n.status} size="sm" variant={n.variant || 'default'} disabled={busy} onClick={() => onStatus(a, n.status)}>{n.label}</Button>
        ))}
        {a.status === 'completada' && onPay && (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onPay(a)}>Registrar pago</Button>
        )}
        {!NEXT[a.status] && a.status !== 'completada' && <StatusBadge status={a.status} />}
      </div>
    </div>
  );
}