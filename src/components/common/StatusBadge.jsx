import { APPT_STATUS } from '@/lib/constants';

export default function StatusBadge({ status }) {
  const s = APPT_STATUS[status] || APPT_STATUS.programada;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}