import { AlertTriangle } from 'lucide-react';

export default function ConflictWarning({ conflicts }) {
  if (!conflicts.length) return null;
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">El dentista ya tiene una cita en ese horario:</p>
        <ul className="mt-1 space-y-0.5">
          {conflicts.map((c) => (
            <li key={c.id}>{c.start_time} · {c.patient_name} ({c.duration_minutes} min)</li>
          ))}
        </ul>
        <p className="mt-1 text-xs">Puede cambiar la hora o guardar de todos modos.</p>
      </div>
    </div>
  );
}