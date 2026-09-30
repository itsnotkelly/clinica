import { PRIORITY } from '@/lib/constants';

export default function PriorityBadge({ priority, showNormal = false }) {
  if (!priority || (priority === 'normal' && !showNormal)) return null;
  const p = PRIORITY[priority];
  return <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${p.cls}`}>{p.label}</span>;
}