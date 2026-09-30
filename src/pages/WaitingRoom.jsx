import { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import WaitingCard from '@/components/waiting/WaitingCard';
import PaymentDialog from '@/components/finance/PaymentDialog';
import { useAppointments, useSetStatus, todayStr } from '@/hooks/useClinicData';

const COLUMNS = [
  { title: 'Próximos', dot: 'bg-slate-400', match: ['programada'] },
  { title: 'Esperando', dot: 'bg-amber-400', match: ['llego', 'esperando'] },
  { title: 'En consulta', dot: 'bg-sky-500', match: ['en_consulta'] },
  { title: 'Finalizados', dot: 'bg-emerald-500', match: ['completada'] },
  { title: 'Cancelados / no-show', dot: 'bg-rose-500', match: ['cancelada', 'no_show'] },
];

export default function WaitingRoom() {
  const { data: appts = [], isLoading } = useAppointments();
  const setStatus = useSetStatus();
  const [now, setNow] = useState(Date.now());
  const [payDialog, setPayDialog] = useState({ open: false });

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const today = appts.filter((a) => a.date === todayStr()).sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div>
      <PageHeader eyebrow="Hoy" title="Sala de espera" subtitle="Cambie el estado de cada paciente con un clic. El tiempo de espera se actualiza automáticamente." />
      {isLoading && <p className="text-sm text-muted-foreground">Cargando…</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {COLUMNS.map((c) => {
          const items = today.filter((a) => c.match.includes(a.status));
          return (
            <section key={c.title} className="rounded-2xl bg-muted/50 p-3">
              <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />{c.title}
                <span className="ml-auto text-xs font-medium text-muted-foreground">{items.length}</span>
              </h2>
              <div className="space-y-2.5">
                {items.map((a) => (
                  <WaitingCard key={a.id} appt={a} now={now} busy={setStatus.isPending} onStatus={(appt, status) => setStatus.mutate({ appt, status })} onPay={(appt) => setPayDialog({ open: true, appointment: appt })} />
                ))}
                {items.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted-foreground">Sin pacientes</p>}
              </div>
            </section>
          );
        })}
      </div>
      <PaymentDialog open={payDialog.open} onOpenChange={(o) => setPayDialog((s) => ({ ...s, open: o }))} appointment={payDialog.appointment} />
    </div>
  );
}