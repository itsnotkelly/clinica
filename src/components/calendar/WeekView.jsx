import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import AppointmentChip from '@/components/calendar/AppointmentChip';

export default function WeekView({ date, appts, onNew, onOpen, onDay }) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((d) => {
        const ds = format(d, 'yyyy-MM-dd');
        const items = appts.filter((a) => a.date === ds).sort((a, b) => a.start_time.localeCompare(b.start_time));
        return (
          <div key={ds} className="flex min-h-[180px] flex-col rounded-2xl border bg-card">
            <button onClick={() => onDay(d)} className="flex items-baseline justify-between border-b px-3 py-2.5 text-left hover:bg-muted/40">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{format(d, 'EEE', { locale: es })}</span>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${isToday(d) ? 'bg-primary text-primary-foreground' : ''}`}>{format(d, 'd')}</span>
            </button>
            <div className="flex-1 space-y-1.5 p-2">
              {items.map((a) => <AppointmentChip key={a.id} appt={a} onClick={onOpen} compact />)}
            </div>
            <button onClick={() => onNew(ds, '09:00')} className="m-2 flex items-center justify-center gap-1 rounded-lg border border-dashed py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">
              <Plus className="h-3 w-3" /> Cita
            </button>
          </div>
        );
      })}
    </div>
  );
}