import { useState } from 'react';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import CalendarToolbar from '@/components/calendar/CalendarToolbar';
import DayView from '@/components/calendar/DayView';
import WeekView from '@/components/calendar/WeekView';
import MonthView from '@/components/calendar/MonthView';
import AppointmentDialog from '@/components/appointments/AppointmentDialog';
import { useAppointments, useStaff } from '@/hooks/useClinicData';

const STEP = { dia: addDays, semana: addWeeks, mes: addMonths };

export default function Calendar() {
  const { data: appts = [] } = useAppointments();
  const { data: staff = [] } = useStaff();
  const [view, setView] = useState('semana');
  const [date, setDate] = useState(new Date());
  const [dentist, setDentist] = useState('all');
  const [dialog, setDialog] = useState({ open: false });

  const visible = dentist === 'all' ? appts : appts.filter((a) => a.dentist_id === dentist);
  const onNew = (d, t) => setDialog({ open: true, defaults: { date: d, start_time: t, ...(dentist !== 'all' && { dentist_id: dentist, dentist_name: staff.find((s) => s.id === dentist)?.full_name }) } });
  const onOpen = (a) => setDialog({ open: true, appointment: a });
  const onDay = (d) => { setDate(d); setView('dia'); };
  const props = { date, appts: visible, onNew, onOpen, onDay };

  return (
    <div>
      <PageHeader eyebrow="Agenda" title="Calendario">
        <Button onClick={() => setDialog({ open: true })}><CalendarPlus className="mr-2 h-4 w-4" />Nueva cita</Button>
      </PageHeader>
      <CalendarToolbar
        view={view} setView={setView} date={date}
        onPrev={() => setDate(STEP[view](date, -1))} onNext={() => setDate(STEP[view](date, 1))} onToday={() => setDate(new Date())}
        dentist={dentist} setDentist={setDentist} dentists={staff.filter((s) => s.role === 'dentista')}
      />
      {view === 'dia' && <DayView {...props} />}
      {view === 'semana' && <WeekView {...props} />}
      {view === 'mes' && <MonthView {...props} />}
      <AppointmentDialog open={dialog.open} onOpenChange={(o) => setDialog((s) => ({ ...s, open: o }))} appointment={dialog.appointment} defaults={dialog.defaults} />
    </div>
  );
}