import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useAppointments, todayStr } from '@/hooks/useClinicData';
import { findConflicts } from '@/lib/constants';
import { logAction } from '@/lib/audit';
import AppointmentFields from '@/components/appointments/AppointmentFields';
import ConflictWarning from '@/components/appointments/ConflictWarning';

const EMPTY = { patient_id: '', patient_name: '', dentist_id: '', dentist_name: '', date: '', start_time: '09:00', duration_minutes: 30, reason: '', priority: 'normal', notes: '', status: 'programada' };
const SYSTEM = ['id', 'created_date', 'updated_date', 'created_by_id', 'created_by', 'is_sample'];

export default function AppointmentDialog({ open, onOpenChange, appointment, defaults }) {
  const qc = useQueryClient();
  const { data: appts = [] } = useAppointments();
  const [form, setForm] = useState(EMPTY);
  const [conflicts, setConflicts] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, date: todayStr(), ...defaults, ...appointment });
      setConflicts([]);
      setError('');
    }
  }, [open]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setConflicts([]); };

  const persist = async (data, action) => {
    setSaving(true);
    let id = appointment?.id;
    if (id) await base44.entities.Appointment.update(id, data);
    else id = (await base44.entities.Appointment.create(data)).id;
    await logAction(action, 'Appointment', id, `${data.patient_name || appointment?.patient_name} · ${data.date || appointment?.date} ${data.start_time || appointment?.start_time}`);
    await qc.invalidateQueries({ queryKey: ['appointments'] });
    setSaving(false);
    onOpenChange(false);
  };

  const save = async (force) => {
    if (!form.patient_id || !form.dentist_id || !form.date || !form.start_time) return setError('Complete paciente, dentista, fecha y hora.');
    const found = findConflicts(appts, form);
    if (found.length && !force) return setConflicts(found);
    const data = Object.fromEntries(Object.entries(form).filter(([k]) => !SYSTEM.includes(k)));
    const moved = appointment && (appointment.date !== data.date || appointment.start_time !== data.start_time);
    if (moved) data.rescheduled_count = (appointment.rescheduled_count || 0) + 1;
    await persist(data, appointment ? (moved ? 'Reprogramación de cita' : 'Modificación de cita') : 'Creación de cita');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{appointment ? 'Editar cita' : 'Nueva cita'}</DialogTitle></DialogHeader>
        <AppointmentFields form={form} set={set} isEdit={!!appointment} />
        <ConflictWarning conflicts={conflicts} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="gap-2 sm:justify-between">
          {appointment && form.status !== 'cancelada' ? (
            <Button variant="ghost" className="text-destructive hover:text-destructive" disabled={saving} onClick={() => persist({ status: 'cancelada' }, 'Cancelación de cita')}>
              Cancelar cita
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            {conflicts.length > 0 && <Button variant="outline" disabled={saving} onClick={() => save(true)}>Guardar de todos modos</Button>}
            <Button disabled={saving} onClick={() => save(false)}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}