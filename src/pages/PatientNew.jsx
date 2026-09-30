import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/common/PageHeader';
import PatientInfoFields from '@/components/patients/PatientInfoFields';
import ClinicalFields from '@/components/patients/ClinicalFields';
import { base44 } from '@/api/base44Client';
import { useRole, todayStr } from '@/hooks/useClinicData';
import { can, fullName } from '@/lib/constants';
import { logAction } from '@/lib/audit';

const Section = ({ title, hint, children }) => (
  <section className="rounded-2xl border bg-card p-6">
    <h2 className="font-semibold">{title}</h2>
    {hint && <p className="mb-5 mt-1 text-sm text-muted-foreground">{hint}</p>}
    {children}
  </section>
);

export default function PatientNew() {
  const role = useRole();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ registration_date: todayStr() });
  const [clinical, setClinical] = useState({});
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.phone) return setError('Nombre, apellido y teléfono son obligatorios.');
    if (!consent) return setError('Debe confirmar el consentimiento para el tratamiento de datos.');
    setSaving(true);
    const p = await base44.entities.Patient.create({
      ...form, patient_code: `PAC-${Date.now().toString().slice(-6)}`, consent_data: true, consent_date: new Date().toISOString(),
    });
    if (can(role, 'clinical') && Object.values(clinical).some(Boolean)) {
      await base44.entities.PatientClinical.create({ ...clinical, patient_id: p.id });
    }
    await logAction('Creación de paciente', 'Patient', p.id, `${fullName(p)} (${p.patient_code})`);
    await qc.invalidateQueries({ queryKey: ['patients'] });
    navigate(`/pacientes/${p.id}`);
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5">
      <PageHeader eyebrow="Pacientes" title="Nuevo paciente" subtitle="Solo solicite la información necesaria para la atención." />
      <Section title="Información personal y de contacto">
        <PatientInfoFields form={form} set={(k, v) => setForm((f) => ({ ...f, [k]: v }))} />
      </Section>
      {can(role, 'clinical') ? (
        <Section title="Información clínica" hint="Visible únicamente para personal clínico autorizado.">
          <ClinicalFields form={clinical} set={(k, v) => setClinical((f) => ({ ...f, [k]: v }))} />
        </Section>
      ) : (
        <p className="flex items-center gap-2 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" /> La información clínica será registrada por el personal clínico.
        </p>
      )}
      <Section title="Consentimiento">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
          <span>El paciente ha sido informado y autoriza a Clínica Dental Asunción a registrar y tratar sus datos personales y clínicos con fines de atención odontológica, conforme a la política de privacidad de la clínica.</span>
        </label>
      </Section>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar y abrir expediente</Button>
      </div>
    </form>
  );
}