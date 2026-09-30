import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PatientInfoFields from '@/components/patients/PatientInfoFields';
import { base44 } from '@/api/base44Client';
import { logAction } from '@/lib/audit';
import { fullName } from '@/lib/constants';

const EDITABLE = ['first_name', 'last_name', 'birth_date', 'sex', 'phone', 'email', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'registration_date', 'admin_notes'];

export default function PatientEditDialog({ open, onOpenChange, patient }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setForm(patient); setError(''); } }, [open]);

  const save = async () => {
    if (!form.first_name || !form.last_name || !form.phone) return setError('Nombre, apellido y teléfono son obligatorios.');
    setSaving(true);
    const data = Object.fromEntries(EDITABLE.map((k) => [k, form[k] ?? '']));
    await base44.entities.Patient.update(patient.id, data);
    await logAction('Edición de paciente', 'Patient', patient.id, `${fullName(data)} (${patient.patient_code})`);
    await Promise.all([qc.invalidateQueries({ queryKey: ['patient', patient.id] }), qc.invalidateQueries({ queryKey: ['patients'] })]);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Editar información del paciente</DialogTitle></DialogHeader>
        <PatientInfoFields form={form} set={(k, v) => setForm((f) => ({ ...f, [k]: v }))} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={saving} onClick={save}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}