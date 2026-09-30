import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from '@/components/patients/FormField';

export default function PatientInfoFields({ form, set }) {
  const input = (key, label, props = {}) => (
    <FormField label={label} className={props.wide ? 'sm:col-span-2' : ''}>
      <Input value={form[key] || ''} onChange={(e) => set(key, e.target.value)} type={props.type || 'text'} />
    </FormField>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {input('first_name', 'Nombre *')}
      {input('last_name', 'Apellido *')}
      {input('birth_date', 'Fecha de nacimiento', { type: 'date' })}
      <FormField label="Sexo (opcional)">
        <Select value={form.sex || 'na'} onValueChange={(v) => set('sex', v === 'na' ? '' : v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="na">No especificar</SelectItem>
            <SelectItem value="femenino">Femenino</SelectItem>
            <SelectItem value="masculino">Masculino</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      {input('phone', 'Teléfono *', { type: 'tel' })}
      {input('email', 'Correo electrónico', { type: 'email' })}
      {input('address', 'Dirección', { wide: true })}
      {input('emergency_contact_name', 'Contacto de emergencia')}
      {input('emergency_contact_phone', 'Teléfono de emergencia', { type: 'tel' })}
      {input('registration_date', 'Fecha de registro', { type: 'date' })}
      <FormField label="Notas administrativas" className="sm:col-span-2">
        <Textarea rows={2} value={form.admin_notes || ''} onChange={(e) => set('admin_notes', e.target.value)} />
      </FormField>
    </div>
  );
}