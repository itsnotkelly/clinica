import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { logAction } from '@/lib/audit';
import { APPT_STATUS } from '@/lib/constants';

export const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export const useRole = () => useAuth().user?.role || 'user';

export const usePatients = () =>
  useQuery({ queryKey: ['patients'], queryFn: () => base44.entities.Patient.list('-created_date', 2000) });

export const useAppointments = () =>
  useQuery({ queryKey: ['appointments'], queryFn: () => base44.entities.Appointment.list('-date', 5000) });

export const usePayments = () =>
  useQuery({ queryKey: ['payments'], queryFn: () => base44.entities.Payment.list('-date', 2000) });

export const useStaff = () =>
  useQuery({ queryKey: ['staff'], queryFn: () => base44.entities.Staff.list('full_name', 500) });

export function useSetStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ appt, status }) => {
      const now = new Date().toISOString();
      const data = { status };
      if (['llego', 'esperando'].includes(status) && !appt.arrival_time) data.arrival_time = now;
      if (status === 'en_consulta') data.consult_start_time = now;
      if (status === 'completada') data.completed_time = now;
      await base44.entities.Appointment.update(appt.id, data);
      await logAction('Cambio de estado de cita', 'Appointment', appt.id, `${appt.patient_name}: ${APPT_STATUS[status].label}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}