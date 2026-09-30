import { CalendarDays, UserCheck, Clock, Stethoscope, CalendarClock, XCircle, UserX } from 'lucide-react';

const STATS = [
  { key: 'total', label: 'Citas de hoy', icon: CalendarDays, tint: 'bg-primary/10 text-primary' },
  { key: 'arrived', label: 'Ya llegaron', icon: UserCheck, tint: 'bg-emerald-50 text-emerald-600' },
  { key: 'waiting', label: 'Esperando', icon: Clock, tint: 'bg-amber-50 text-amber-600' },
  { key: 'consult', label: 'En consulta', icon: Stethoscope, tint: 'bg-sky-50 text-sky-600' },
  { key: 'remaining', label: 'Restantes', icon: CalendarClock, tint: 'bg-slate-100 text-slate-500' },
  { key: 'cancelled', label: 'Canceladas', icon: XCircle, tint: 'bg-rose-50 text-rose-500' },
  { key: 'noshow', label: 'No-shows', icon: UserX, tint: 'bg-rose-100/70 text-rose-600' },
];

export default function StatCards({ todays }) {
  const count = (fn) => todays.filter(fn).length;
  const values = {
    total: todays.length,
    arrived: count((a) => a.arrival_time),
    waiting: count((a) => ['llego', 'esperando'].includes(a.status)),
    consult: count((a) => a.status === 'en_consulta'),
    remaining: count((a) => a.status === 'programada'),
    cancelled: count((a) => a.status === 'cancelada'),
    noshow: count((a) => a.status === 'no_show'),
  };

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border/70 bg-card sm:grid-cols-4 xl:grid-cols-7 xl:divide-x xl:divide-border/60">
      {STATS.map(({ key, label, icon: Icon, tint }) => (
        <div key={key} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tint}`}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-2xl font-semibold leading-none tabular-nums tracking-tight">{values[key]}</p>
            <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}