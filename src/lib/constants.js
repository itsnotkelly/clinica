export const STAFF_ROLES = ['admin', 'recepcion', 'dentista', 'asistente'];

export const ROLE_LABELS = {
  admin: 'Administrador',
  recepcion: 'Recepción',
  dentista: 'Dentista',
  asistente: 'Asistente',
  user: 'Sin rol asignado',
};

const PERMISSIONS = {
  clinical: ['admin', 'dentista', 'asistente'],
  admin: ['admin'],
  finance: ['admin', 'dentista', 'recepcion'],
};

export const can = (role, perm) => PERMISSIONS[perm]?.includes(role) || false;

export const APPT_STATUS = {
  programada: { label: 'Programada', cls: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400', chip: 'border-l-slate-400 bg-slate-50' },
  llego: { label: 'Llegó', cls: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-400', chip: 'border-l-amber-400 bg-amber-50' },
  esperando: { label: 'Esperando', cls: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-400', chip: 'border-l-amber-400 bg-amber-50' },
  en_consulta: { label: 'En consulta', cls: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500', chip: 'border-l-sky-500 bg-sky-50' },
  completada: { label: 'Completada', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', chip: 'border-l-emerald-500 bg-emerald-50' },
  cancelada: { label: 'Cancelada', cls: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500', chip: 'border-l-rose-400 bg-rose-50/60 line-through' },
  no_show: { label: 'No se presentó', cls: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500', chip: 'border-l-rose-400 bg-rose-50/60' },
};

export const PRIORITY = {
  normal: { label: 'Normal', cls: 'bg-slate-100 text-slate-600' },
  prioridad: { label: 'Prioridad', cls: 'bg-orange-50 text-orange-700' },
  urgente: { label: 'Urgente', cls: 'bg-rose-100 text-rose-700' },
};

export const INACTIVE = ['cancelada', 'no_show'];

export const fullName = (p) => (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : '');

export const toMin = (t) => {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return h * 60 + m;
};

export const minToTime = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const findConflicts = (appts, form) => {
  const s = toMin(form.start_time);
  const e = s + Number(form.duration_minutes || 30);
  return appts.filter((a) => {
    if (a.id === form.id || a.dentist_id !== form.dentist_id || a.date !== form.date || INACTIVE.includes(a.status)) return false;
    const as = toMin(a.start_time);
    return s < as + (a.duration_minutes || 30) && as < e;
  });
};