import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PatientPicker from '@/components/appointments/PatientPicker';
import { useStaff } from '@/hooks/useClinicData';
import { APPT_STATUS, PRIORITY, fullName } from '@/lib/constants';

const DURATIONS = [15, 30, 45, 60, 90, 120];

const Field = ({ label, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export default function AppointmentFields({ form, set, isEdit }) {
  const { data: staff = [] } = useStaff();
  const dentists = staff.filter((s) => s.role === 'dentista' && s.active !== false);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Paciente *" className="col-span-2">
        <PatientPicker value={form.patient_id} onChange={(p) => { set('patient_id', p.id); set('patient_name', fullName(p)); }} />
      </Field>
      <Field label="Dentista *" className="col-span-2">
        <Select value={form.dentist_id} onValueChange={(v) => { set('dentist_id', v); set('dentist_name', dentists.find((d) => d.id === v)?.full_name || ''); }}>
          <SelectTrigger><SelectValue placeholder="Seleccionar dentista" /></SelectTrigger>
          <SelectContent>
            {dentists.map((d) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Fecha *"><Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
      <Field label="Hora *"><Input type="time" step="900" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} /></Field>
      <Field label="Duración">
        <Select value={String(form.duration_minutes)} onValueChange={(v) => set('duration_minutes', Number(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{DURATIONS.map((d) => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Prioridad (definida por el personal)">
        <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(PRIORITY).map(([k, p]) => <SelectItem key={k} value={k}>{p.label}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Motivo / procedimiento" className="col-span-2">
        <Input value={form.reason} onChange={(e) => set('reason', e.target.value)} placeholder="Ej. Limpieza dental" />
      </Field>
      {isEdit && (
        <Field label="Estado" className="col-span-2">
          <Select value={form.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(APPT_STATUS).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      )}
      <Field label="Notas administrativas" className="col-span-2">
        <Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>
    </div>
  );
}