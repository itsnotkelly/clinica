import { Textarea } from '@/components/ui/textarea';
import FormField from '@/components/patients/FormField';

export const CLINICAL_FIELDS = [
  ['allergies', 'Alergias'],
  ['medications', 'Medicamentos relevantes'],
  ['medical_history', 'Antecedentes relevantes'],
  ['dental_notes', 'Información odontológica'],
  ['observations', 'Observaciones'],
];

export default function ClinicalFields({ form, set }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CLINICAL_FIELDS.map(([key, label]) => (
        <FormField key={key} label={label} className={key === 'observations' ? 'sm:col-span-2' : ''}>
          <Textarea rows={2} value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
        </FormField>
      ))}
    </div>
  );
}