import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { logAction } from '@/lib/audit';
import ClinicalFields, { CLINICAL_FIELDS } from '@/components/patients/ClinicalFields';

export default function ClinicalTab({ patientId, patientName }) {
  const qc = useQueryClient();
  const { data: record, isLoading } = useQuery({
    queryKey: ['clinical', patientId],
    queryFn: async () => (await base44.entities.PatientClinical.filter({ patient_id: patientId }))[0] || null,
  });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const data = Object.fromEntries(CLINICAL_FIELDS.map(([k]) => [k, form[k] || '']));
    if (record) await base44.entities.PatientClinical.update(record.id, data);
    else await base44.entities.PatientClinical.create({ ...data, patient_id: patientId });
    const changed = CLINICAL_FIELDS.filter(([k, l]) => (record?.[k] || '') !== data[k]).map(([, l]) => l).join(', ');
    await logAction('Modificación de información clínica', 'PatientClinical', patientId, `${patientName} · Campos: ${changed || 'ninguno'}`);
    await qc.invalidateQueries({ queryKey: ['clinical', patientId] });
    setSaving(false);
    setForm(null);
  };

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {record ? `Última actualización: ${format(new Date(record.updated_date), 'dd/MM/yyyy HH:mm')}` : 'Sin información clínica registrada'}
        </p>
        {!form && <Button size="sm" variant="outline" onClick={() => setForm(record || {})}><Pencil className="mr-2 h-3.5 w-3.5" />Editar</Button>}
      </div>
      {form ? (
        <div className="space-y-4">
          <ClinicalFields form={form} set={(k, v) => setForm((f) => ({ ...f, [k]: v }))} />
          <p className="text-xs text-muted-foreground">Cada cambio queda registrado en el registro de actividad.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setForm(null)}>Cancelar</Button>
            <Button disabled={saving} onClick={save}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar</Button>
          </div>
        </div>
      ) : (
        <dl className="grid gap-5 sm:grid-cols-2">
          {CLINICAL_FIELDS.map(([k, l]) => (
            <div key={k} className={k === 'allergies' && record?.allergies ? 'rounded-xl bg-rose-50 p-3' : ''}>
              <dt className="text-xs text-muted-foreground">{l}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-sm font-medium">{record?.[k] || '—'}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}