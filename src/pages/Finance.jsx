import { useEffect, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PeriodPicker from '@/components/finance/PeriodPicker';
import SummaryCards from '@/components/finance/SummaryCards';
import IncomeCharts from '@/components/finance/IncomeCharts';
import BreakdownTables from '@/components/finance/BreakdownTables';
import PendingPayments from '@/components/finance/PendingPayments';
import PaymentDialog from '@/components/finance/PaymentDialog';
import ReceiptDialog from '@/components/finance/ReceiptDialog';
import { useAppointments, usePayments, useRole } from '@/hooks/useClinicData';
import { can } from '@/lib/constants';
import { METHOD_LABELS, activePayments, byMethod, byService, dailySeries, monthlySeries, paymentsInRange, pendingGroups, periodRange } from '@/lib/finance';

export default function Finance() {
  const role = useRole();
  const { data: payments = [], isLoading } = usePayments();
  const { data: appts = [] } = useAppointments();
  const [period, setPeriod] = useState({ key: 'mes' });
  const [range, setRange] = useState(() => periodRange('mes'));
  const [payDialog, setPayDialog] = useState({ open: false });
  const [receipt, setReceipt] = useState({ open: false, payment: null });

  useEffect(() => {
    setRange(periodRange(period.key, period.from, period.to));
  }, [period]);

  if (!can(role, 'finance')) {
    return <p className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Su rol no tiene acceso a la información financiera.</p>;
  }

  const active = activePayments(payments);
  const inRange = paymentsInRange(payments, range.start, range.end);
  const received = inRange.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const services = byService(inRange, payments);
  const methods = byMethod(inRange);
  const pending = pendingGroups(payments);
  const week = periodRange('semana');
  const { open, ...preset } = payDialog;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finanzas" title="Ingresos y cobros" subtitle="Resumen de los pagos recibidos de pacientes y saldos pendientes de cobro." />
      <PeriodPicker value={period} onChange={setPeriod} />
      <SummaryCards
        received={received}
        count={inRange.length}
        avg={inRange.length ? received / inRange.length : 0}
        done={services.reduce((s, x) => s + x.count, 0)}
        pending={pending.reduce((s, g) => s + g.balance, 0)}
      />
      <IncomeCharts
        week={dailySeries(active, week.start, week.end)}
        year={monthlySeries(active)}
        services={services.map((s) => ({ name: s.service, value: s.total }))}
        methods={methods.map((m) => ({ name: METHOD_LABELS[m.method], value: m.total }))}
      />
      <BreakdownTables services={services} methods={methods.map((m) => ({ ...m, label: METHOD_LABELS[m.method] }))} />
      <section>
        <h2 className="mb-3 font-semibold">Pagos pendientes</h2>
        <PendingPayments
          groups={pending}
          appts={appts}
          onAbono={(g) => setPayDialog({ open: true, patientId: g.patient_id, patientName: g.patient_name, appointmentId: g.appointment_id, service: g.service, price: g.price })}
        />
      </section>
      {isLoading && <p className="text-sm text-muted-foreground">Cargando pagos…</p>}
      <PaymentDialog open={open} onOpenChange={(o) => setPayDialog((s) => ({ ...s, open: o }))} onSaved={(p) => setReceipt({ open: true, payment: p })} {...preset} />
      <ReceiptDialog open={receipt.open} onOpenChange={(o) => setReceipt((s) => ({ ...s, open: o }))} payment={receipt.payment} />
    </div>
  );
}