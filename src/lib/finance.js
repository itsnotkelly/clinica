import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, format, isWithinInterval, eachDayOfInterval, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export const money = (n) => `$${(Math.round((Number(n) || 0) * 100) / 100).toFixed(2)}`;

export const METHOD_LABELS = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', otro: 'Otro' };

export const PAYMENT_STATUS = {
  pagado: { label: 'Pagado', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  parcial: { label: 'Parcial', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  pendiente: { label: 'Pendiente', cls: 'bg-slate-100 text-slate-600 ring-slate-200' },
  anulado: { label: 'Anulado', cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

export const statusFor = (paid, price) =>
  paid <= 0.005 ? 'pendiente' : paid + 0.005 >= (Number(price) || 0) ? 'pagado' : 'parcial';

export const activePayments = (list = []) => list.filter((p) => !p.cancelled);

export const groupKey = (p) => p.appointment_id || p.id;

// Agrupa los pagos por servicio (cita relacionada, o el propio pago si no tiene cita)
export const paymentGroups = (list = []) => {
  const groups = {};
  for (const p of activePayments(list)) {
    const k = groupKey(p);
    if (!groups[k]) {
      groups[k] = {
        key: k,
        appointment_id: p.appointment_id || null,
        patient_id: p.patient_id,
        patient_name: p.patient_name,
        service: p.service || 'Servicio',
        price: 0,
        paid: 0,
        last_date: p.date,
        payments: [],
      };
    }
    const g = groups[k];
    g.price = Math.max(g.price, Number(p.total_price) || 0);
    g.paid += Number(p.amount) || 0;
    g.payments.push(p);
    if ((p.date || '') > (g.last_date || '')) g.last_date = p.date;
  }
  return Object.values(groups).map((g) => ({ ...g, balance: Math.max(0, Math.round((g.price - g.paid) * 100) / 100) }));
};

export const pendingGroups = (list = []) => paymentGroups(list).filter((g) => g.balance > 0.005);

export const patientTotals = (list, patientId) => {
  const gs = paymentGroups(list).filter((g) => g.patient_id === patientId);
  return {
    billed: Math.round(gs.reduce((s, g) => s + g.price, 0) * 100) / 100,
    paid: Math.round(gs.reduce((s, g) => s + g.paid, 0) * 100) / 100,
    balance: Math.round(gs.reduce((s, g) => s + g.balance, 0) * 100) / 100,
    groups: gs,
  };
};

export const periodRange = (key, from, to) => {
  const now = new Date();
  switch (key) {
    case 'hoy': return { start: startOfDay(now), end: endOfDay(now) };
    case 'semana': return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'mes': return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'anio': return { start: startOfYear(now), end: endOfYear(now) };
    default: {
      const f = from || format(now, 'yyyy-MM-dd');
      return { start: startOfDay(parseISO(f)), end: endOfDay(parseISO(to || f)) };
    }
  }
};

export const paymentsInRange = (list, start, end) =>
  activePayments(list).filter((p) => {
    try {
      return p.date && isWithinInterval(parseISO(p.date), { start, end });
    } catch {
      return false;
    }
  });

export const byMethod = (list = []) => {
  const m = {};
  for (const p of list) m[p.method || 'otro'] = (m[p.method || 'otro'] || 0) + (Number(p.amount) || 0);
  return Object.entries(m)
    .map(([method, total]) => ({ method, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);
};

// Ingresos por tratamiento en el período + cuántas veces se realizó cada servicio
export const byService = (rangePayments, allPayments) => {
  const totals = {};
  for (const p of rangePayments) {
    const s = p.service || 'Servicio';
    totals[s] = (totals[s] || 0) + (Number(p.amount) || 0);
  }
  const ids = new Set(rangePayments.map((p) => p.id));
  const counts = {};
  for (const g of paymentGroups(allPayments)) {
    if (g.payments.some((p) => ids.has(p.id))) counts[g.service] = (counts[g.service] || 0) + 1;
  }
  return Object.keys(totals)
    .map((s) => ({ service: s, total: Math.round(totals[s] * 100) / 100, count: counts[s] || 0 }))
    .sort((a, b) => b.total - a.total);
};

export const dailySeries = (list, start, end) => {
  let days = eachDayOfInterval({ start, end });
  if (days.length > 31) days = days.slice(0, 31);
  return days.map((d) => {
    const ds = format(d, 'yyyy-MM-dd');
    const total = list.filter((p) => p.date === ds).reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return { label: format(d, 'd MMM', { locale: es }), total: Math.round(total * 100) / 100 };
  });
};

export const monthlySeries = (list) => {
  const year = new Date().getFullYear();
  const totals = Array(12).fill(0);
  for (const p of list) {
    if (!p.date || !p.date.startsWith(String(year))) continue;
    totals[Number(p.date.slice(5, 7)) - 1] += Number(p.amount) || 0;
  }
  return totals.map((t, i) => ({
    label: format(addMonths(new Date(year, 0, 1), i), 'MMM', { locale: es }),
    total: Math.round(t * 100) / 100,
  }));
};

export const genReceiptNo = () => `REC-${format(new Date(), 'yyyyMMdd')}-${String(Math.floor(1000 + Math.random() * 9000))}`;