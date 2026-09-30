import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import DemoBadge from '@/components/common/DemoBadge';
import StatusBadge from '@/components/common/StatusBadge';
import { fullName } from '@/lib/constants';

const d = (s) => (s ? format(parseISO(s), 'd MMM yyyy', { locale: es }) : '—');

export default function PatientTable({ rows }) {
  const navigate = useNavigate();
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-3 font-medium">Paciente</th>
            <th className="px-5 py-3 font-medium">Teléfono</th>
            <th className="hidden px-5 py-3 font-medium md:table-cell">Próxima cita</th>
            <th className="hidden px-5 py-3 font-medium md:table-cell">Última visita</th>
            <th className="px-5 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(({ p, next, last, hasToday, todayAppt }) => (
            <tr key={p.id} onClick={() => navigate(`/pacientes/${p.id}`)} className="cursor-pointer transition hover:bg-muted/50">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2 font-medium">{fullName(p)} <DemoBadge show={p.is_demo} /></div>
                <div className="text-xs text-muted-foreground">{p.patient_code}</div>
              </td>
              <td className="px-5 py-3.5 tabular-nums">{p.phone}</td>
              <td className="hidden px-5 py-3.5 md:table-cell">{next ? `${d(next.date)} · ${next.start_time}` : '—'}</td>
              <td className="hidden px-5 py-3.5 md:table-cell">{d(last?.date)}</td>
              <td className="px-5 py-3.5">{hasToday && todayAppt ? <StatusBadge status={todayAppt.status} /> : <span className="text-muted-foreground">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}