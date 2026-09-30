import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import PriorityBadge from '@/components/common/PriorityBadge';
import PaymentChip from '@/components/finance/PaymentChip';
import PaymentDialog from '@/components/finance/PaymentDialog';
import ReceiptDialog from '@/components/finance/ReceiptDialog';
import { INACTIVE } from '@/lib/constants';
import { paymentGroups } from '@/lib/finance';
import { usePayments, useSetStatus } from '@/hooks/useClinicData';

export default function TodayAgenda({ todays, isLoading }) {
  const setStatus = useSetStatus();
  const { data: payments = [] } = usePayments();
  const [payDialog, setPayDialog] = useState({ open: false });
  const [receipt, setReceipt] = useState({ open: false, payment: null });
  const groups = paymentGroups(payments);
  const groupFor = (id) => groups.find((g) => g.appointment_id === id);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm shadow-primary/[0.03]">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="flex items-center gap-2.5 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-primary">
              <CalendarDays className="h-4 w-4" strokeWidth={2} />
            </span>
            Agenda de hoy
            <span className="ml-0.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">{todays.length}</span>
          </h2>
          <Link to="/sala-de-espera" className="group flex items-center gap-0.5 text-sm font-medium text-primary hover:text-primary/80">
            Sala de espera
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="h-px bg-border/60" />
        {isLoading && <p className="p-6 text-sm text-muted-foreground">Cargando…</p>}
        {!isLoading && todays.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No hay citas programadas para hoy.</p>}
        <ul>
          {todays.map((a) => {
            const active = a.status === 'en_consulta';
            const inactive = INACTIVE.includes(a.status);
            const g = a.status === 'completada' ? groupFor(a.id) : null;
            return (
              <li
                key={a.id}
                className={`relative flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/30 ${
                  active ? 'bg-accent/40' : inactive ? 'opacity-65' : ''
                } ${a === todays[todays.length - 1] ? '' : 'border-b border-border/40'}`}
              >
                <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${active ? 'bg-primary' : 'bg-transparent'}`} />
                <span className="w-11 shrink-0 text-sm font-semibold tabular-nums text-foreground/75">{a.start_time}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/pacientes/${a.patient_id}`} className="truncate text-[15px] font-semibold tracking-tight hover:text-primary">{a.patient_name}</Link>
                    <PriorityBadge priority={a.priority} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{a.reason || 'Sin motivo'} · {a.dentist_name}</p>
                </div>
                {a.status === 'completada' && (
                  <PaymentChip
                    group={g}
                    onRegister={() => setPayDialog({ open: true, appointment: a })}
                    onAbono={(grp) => setPayDialog({ open: true, patientId: grp.patient_id, patientName: grp.patient_name, appointmentId: grp.appointment_id, service: grp.service, price: grp.price })}
                    onView={(p) => setReceipt({ open: true, payment: p })}
                  />
                )}
                {a.status === 'programada' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full px-3 text-xs hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                    disabled={setStatus.isPending}
                    onClick={() => setStatus.mutate({ appt: a, status: 'esperando' })}
                  >
                    Llegó
                  </Button>
                )}
                <StatusBadge status={a.status} />
              </li>
            );
          })}
        </ul>
      </section>
      <PaymentDialog
        open={payDialog.open}
        onOpenChange={(o) => setPayDialog((s) => ({ ...s, open: o }))}
        appointment={payDialog.appointment}
        patientId={payDialog.patientId}
        patientName={payDialog.patientName}
        appointmentId={payDialog.appointmentId}
        service={payDialog.service}
        price={payDialog.price}
        onSaved={(p) => setReceipt({ open: true, payment: p })}
      />
      <ReceiptDialog open={receipt.open} onOpenChange={(o) => setReceipt((s) => ({ ...s, open: o }))} payment={receipt.payment} />
    </>
  );
}