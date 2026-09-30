import { format, parseISO } from 'date-fns';

const fmt = (s) => (s ? format(parseISO(s), 'dd/MM/yyyy') : '—');

const Item = ({ label, value }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium">{value || '—'}</dd>
  </div>
);

export default function InfoTab({ patient: p }) {
  return (
    <div className="space-y-5 rounded-2xl border bg-card p-6">
      <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Item label="Fecha de nacimiento" value={fmt(p.birth_date)} />
        <Item label="Sexo" value={p.sex ? p.sex[0].toUpperCase() + p.sex.slice(1) : ''} />
        <Item label="Teléfono" value={p.phone} />
        <Item label="Correo" value={p.email} />
        <Item label="Dirección" value={p.address} />
        <Item label="Fecha de registro" value={fmt(p.registration_date)} />
        <Item label="Contacto de emergencia" value={p.emergency_contact_name} />
        <Item label="Teléfono de emergencia" value={p.emergency_contact_phone} />
        <Item label="Consentimiento de datos" value={p.consent_data ? `Otorgado · ${fmt(p.consent_date)}` : 'Pendiente'} />
      </dl>
      {p.admin_notes && (
        <div className="rounded-xl bg-muted/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notas administrativas</p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{p.admin_notes}</p>
        </div>
      )}
    </div>
  );
}