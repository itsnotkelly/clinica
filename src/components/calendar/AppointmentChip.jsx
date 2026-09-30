import { APPT_STATUS } from '@/lib/constants';
import PriorityBadge from '@/components/common/PriorityBadge';

export default function AppointmentChip({ appt, onClick, compact }) {
  const s = APPT_STATUS[appt.status] || APPT_STATUS.programada;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(appt); }}
      className={`w-full rounded-lg border-l-[3px] px-2.5 py-1.5 text-left text-xs transition hover:brightness-95 ${s.chip} ${compact ? '' : 'sm:max-w-xs'}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="font-semibold tabular-nums">{appt.start_time}</span>
        <span className="truncate font-medium">{appt.patient_name}</span>
        {!compact && <PriorityBadge priority={appt.priority} />}
      </div>
      {!compact && <p className="truncate text-muted-foreground">{appt.reason} · {appt.dentist_name} · {s.label}</p>}
    </button>
  );
}