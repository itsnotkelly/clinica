import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { INACTIVE } from '@/lib/constants';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function MonthView({ date, appts, onDay }) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((w) => <div key={w} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">{w}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const ds = format(d, 'yyyy-MM-dd');
          const items = appts.filter((a) => a.date === ds && !INACTIVE.includes(a.status)).sort((a, b) => a.start_time.localeCompare(b.start_time));
          return (
            <button key={ds} onClick={() => onDay(d)} className={`min-h-[92px] border-b border-r p-1.5 text-left transition hover:bg-muted/40 ${isSameMonth(d, date) ? '' : 'bg-muted/20 text-muted-foreground/50'}`}>
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday(d) ? 'bg-primary text-primary-foreground' : ''}`}>{format(d, 'd')}</span>
              <div className="mt-1 hidden space-y-0.5 sm:block">
                {items.slice(0, 3).map((a) => (
                  <p key={a.id} className="truncate rounded bg-accent/70 px-1.5 py-0.5 text-[11px]"><span className="font-semibold">{a.start_time}</span> {a.patient_name}</p>
                ))}
                {items.length > 3 && <p className="px-1.5 text-[11px] text-muted-foreground">+{items.length - 3} más</p>}
              </div>
              {items.length > 0 && <span className="mt-1 block text-[11px] font-medium text-primary sm:hidden">{items.length}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}