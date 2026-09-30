import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Phone, CalendarClock, Pencil, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DemoBadge from '@/components/common/DemoBadge';
import { fullName } from '@/lib/constants';

export default function RecordHeader({ patient, next, last, onEdit, onNewAppt }) {
  const initials = `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`.toUpperCase();
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent font-display text-2xl text-primary">{initials}</div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight">{fullName(patient)}</h1>
            <DemoBadge show={patient.is_demo} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{patient.patient_code}</span>
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{patient.phone}</span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              Próxima cita: {next ? `${format(parseISO(next.date), 'd MMM yyyy', { locale: es })} · ${next.start_time}` : 'sin programar'}
            </span>
            <span>Última visita: {last ? format(parseISO(last.date), 'd MMM yyyy', { locale: es }) : '—'}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}><Pencil className="mr-2 h-4 w-4" />Editar</Button>
          <Button onClick={onNewAppt}><CalendarPlus className="mr-2 h-4 w-4" />Nueva cita</Button>
        </div>
      </div>
    </div>
  );
}