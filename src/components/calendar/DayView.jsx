import { format } from 'date-fns';
import { minToTime, toMin } from '@/lib/constants';
import AppointmentChip from '@/components/calendar/AppointmentChip';

const SLOTS = Array.from({ length: 26 }, (_, i) => 7 * 60 + i * 30); // 07:00 – 19:30

export default function DayView({ date, appts, onNew, onOpen }) {
  const ds = format(date, 'yyyy-MM-dd');
  const list = appts.filter((a) => a.date === ds);
  const inSlot = (a, slot, i) => {
    const s = toMin(a.start_time);
    if (i === 0) return s < slot + 30;
    if (i === SLOTS.length - 1) return s >= slot;
    return s >= slot && s < slot + 30;
  };

  return (
    <div className="divide-y overflow-hidden rounded-2xl border bg-card">
      {SLOTS.map((slot, i) => {
        const items = list.filter((a) => inSlot(a, slot, i)).sort((a, b) => a.start_time.localeCompare(b.start_time));
        return (
          <div key={slot} className="flex min-h-[52px]">
            <div className={`w-16 shrink-0 py-2 pl-4 text-xs tabular-nums ${slot % 60 === 0 ? 'text-foreground' : 'text-muted-foreground/60'}`}>{minToTime(slot)}</div>
            <div onClick={() => onNew(ds, minToTime(slot))} className="grid flex-1 cursor-pointer gap-1.5 p-1.5 transition hover:bg-muted/40 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((a) => <AppointmentChip key={a.id} appt={a} onClick={onOpen} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}