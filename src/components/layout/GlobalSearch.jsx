import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, CalendarDays } from 'lucide-react';
import { usePatients, useAppointments, todayStr } from '@/hooks/useClinicData';
import { fullName, normalize } from '@/lib/constants';

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { data: patients = [] } = usePatients();
  const { data: appts = [] } = useAppointments();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const n = normalize(q.trim());
    if (n.length < 2) return { p: [], a: [] };
    const p = patients.filter((x) => [fullName(x), x.phone, x.patient_code, x.email].some((f) => normalize(f).includes(n))).slice(0, 6);
    const t = todayStr();
    const a = appts
      .filter((x) => x.date >= t && [x.patient_name, x.reason].some((f) => normalize(f).includes(n)))
      .sort((x, y) => (x.date + x.start_time).localeCompare(y.date + y.start_time))
      .slice(0, 5);
    return { p, a };
  }, [q, patients, appts]);

  const go = (path) => {
    setQ('');
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={ref}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar paciente, teléfono, ID o cita…  ( / )"
        className="h-10 w-full rounded-xl border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
      />
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border bg-popover shadow-lg">
          {results.p.length === 0 && results.a.length === 0 && <p className="p-4 text-sm text-muted-foreground">Sin resultados</p>}
          {results.p.length > 0 && <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pacientes</p>}
          {results.p.map((p) => (
            <button key={p.id} onMouseDown={() => go(`/pacientes/${p.id}`)} className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 font-medium">{fullName(p)}</span>
              <span className="text-xs text-muted-foreground">{p.patient_code} · {p.phone}</span>
            </button>
          ))}
          {results.a.length > 0 && <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Próximas citas</p>}
          {results.a.map((a) => (
            <button key={a.id} onMouseDown={() => go(`/pacientes/${a.patient_id}`)} className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-muted">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1"><span className="font-medium">{a.patient_name}</span> · {a.reason}</span>
              <span className="text-xs text-muted-foreground">{a.date} {a.start_time}</span>
            </button>
          ))}
          <div className="h-2" />
        </div>
      )}
    </div>
  );
}