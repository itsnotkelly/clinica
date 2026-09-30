import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import PatientTable from '@/components/patients/PatientTable';
import { patientStats } from '@/components/patients/patientStats';
import { usePatients, useAppointments, todayStr } from '@/hooks/useClinicData';
import { fullName, normalize } from '@/lib/constants';

const FILTERS = [
  { key: 'all', label: 'Todos', fn: () => true },
  { key: 'today', label: 'Con cita hoy', fn: (r) => r.hasToday },
  { key: 'next', label: 'Con próxima cita', fn: (r) => !!r.next },
  { key: 'none', label: 'Sin próxima cita', fn: (r) => !r.next },
];

export default function Patients() {
  const { data: patients = [], isLoading } = usePatients();
  const { data: appts = [] } = useAppointments();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const t = todayStr();

  const rows = useMemo(() => {
    const n = normalize(q.trim());
    const f = FILTERS.find((x) => x.key === filter).fn;
    return patients
      .map((p) => {
        const s = patientStats(p.id, appts, t);
        return { p, ...s, todayAppt: s.mine.find((a) => a.date === t) };
      })
      .filter((r) => !n || [fullName(r.p), r.p.phone, r.p.patient_code, r.p.email].some((x) => normalize(x).includes(n)))
      .filter(f)
      .sort((a, b) => fullName(a.p).localeCompare(fullName(b.p)));
  }, [patients, appts, q, filter, t]);

  return (
    <div>
      <PageHeader eyebrow="Expedientes" title="Pacientes" subtitle={`${patients.length} pacientes registrados`}>
        <Button asChild><Link to="/pacientes/nuevo"><UserPlus className="mr-2 h-4 w-4" />Nuevo paciente</Link></Button>
      </PageHeader>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, apellido, teléfono, ID o correo"
            className="h-11 w-full rounded-xl border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${filter === f.key ? 'bg-primary text-primary-foreground' : 'border bg-card text-muted-foreground hover:text-foreground'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? <p className="p-6 text-sm text-muted-foreground">Cargando pacientes…</p>
        : rows.length === 0 ? <p className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">No se encontraron pacientes.</p>
        : <PatientTable rows={rows} />}
    </div>
  );
}