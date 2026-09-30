import { INACTIVE } from '@/lib/constants';

export function patientStats(patientId, appts, today) {
  const mine = appts.filter((a) => a.patient_id === patientId);
  const next = mine
    .filter((a) => a.date >= today && !INACTIVE.includes(a.status) && a.status !== 'completada')
    .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time))[0];
  const last = mine
    .filter((a) => a.status === 'completada')
    .sort((a, b) => (b.date + b.start_time).localeCompare(a.date + a.start_time))[0];
  return { mine, next, last, hasToday: mine.some((a) => a.date === today && !INACTIVE.includes(a.status)) };
}