import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/lib/AuthContext';
import { useAppointments, todayStr, useRole } from '@/hooks/useClinicData';
import { can } from '@/lib/constants';
import FinanceCards from '@/components/dashboard/FinanceCards';
import StatCards from '@/components/dashboard/StatCards';
import TodayAgenda from '@/components/dashboard/TodayAgenda';
import QuickActions from '@/components/dashboard/QuickActions';
import AppointmentDialog from '@/components/appointments/AppointmentDialog';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
};

export default function Dashboard() {
  const { user } = useAuth();
  const role = useRole();
  const { data: appts = [], isLoading } = useAppointments();
  const [dialog, setDialog] = useState(false);
  const t = todayStr();
  const todays = appts.filter((a) => a.date === t).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const first = (user?.full_name || '').split(' ')[0];
  const dateLabel = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });
  const dayNum = format(new Date(), 'd');
  const monthAbbr = format(new Date(), 'MMM', { locale: es }).replace('.', '').toUpperCase();

  return (
    <div className="space-y-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">Clínica Dental Asunción</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-[1.9rem]">
            {greeting()}{first ? `, ${first}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-accent/40 px-4 py-3">
          <div className="text-center">
            <p className="font-display text-2xl font-semibold leading-none text-primary">{dayNum}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">{monthAbbr}</p>
          </div>
          <div className="h-9 w-px bg-primary/10" />
          <p className="max-w-[130px] text-[11px] leading-snug text-muted-foreground">
            {todays.length > 0 ? `${todays.length} ${todays.length === 1 ? 'cita' : 'citas'} programadas para hoy` : 'Sin citas programadas hoy'}
          </p>
        </div>
      </div>
      <StatCards todays={todays} />
      {can(role, 'finance') && <FinanceCards />}
      <div className="grid gap-6 lg:grid-cols-[1fr_250px] xl:gap-8">
        <TodayAgenda todays={todays} isLoading={isLoading} />
        <QuickActions onNewAppointment={() => setDialog(true)} />
      </div>
      <AppointmentDialog open={dialog} onOpenChange={setDialog} />
    </div>
  );
}