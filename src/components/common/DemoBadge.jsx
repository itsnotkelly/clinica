export default function DemoBadge({ show }) {
  if (!show) return null;
  return (
    <span className="rounded-md border border-dashed border-violet-300 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
      Demo
    </span>
  );
}