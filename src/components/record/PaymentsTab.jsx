import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { FileText, Pencil, Plus, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePayments, useRole } from '@/hooks/useClinicData';
import { can, fullName } from '@/lib/constants';
import { base44 } from '@/api/base44Client';
import { logAction } from '@/lib/audit';
import { METHOD_LABELS, PAYMENT_STATUS, money, patientTotals } from '@/lib/finance';
import PaymentDialog from '@/components/finance/PaymentDialog';
import ReceiptDialog from '@/components/finance/ReceiptDialog';

const StatusPill = ({ status }) => {
  const s = PAYMENT_STATUS[status] || PAYMENT_STATUS.pendiente;
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}>{s.label}</span>;
};

export default function PaymentsTab({ patient }) {
  const role = useRole();
  const qc = useQueryClient();
  const { data: payments = [] } = usePayments();
  const totals = patientTotals(payments, patient.id);
  const rows = payments.filter((p) => p.patient_id === patient.id).sort((a, b) => (b.date + (b.receipt_no || '')).localeCompare(a.date + (a.receipt_no || '')));
  const [payDialog, setPayDialog] = useState({ open: false });
  const [receipt, setReceipt] = useState({ open: false, payment: null });
  const [cancelDlg, setCancelDlg] = useState({ open: false, payment: null });
  const [reason, setReason] = useState('');

  const cancel = async () => {
    const p = cancelDlg.payment;
    await base44.entities.Payment.update(p.id, { cancelled: true, cancel_reason: reason || 'Sin motivo indicado' });
    await logAction('Cancelación de pago', 'Payment', p.id, `${p.patient_name} · ${p.service} · ${money(p.amount)} · Motivo: ${reason || 'no indicado'}`);
    await qc.invalidateQueries({ queryKey: ['payments'] });
    setCancelDlg({ open: false });
    setReason('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border/70 bg-card sm:divide-x sm:divide-border/60">
        <div className="px-4 py-3.5">
          <p className="text-lg font-semibold tabular-nums sm:text-xl">{money(totals.billed)}</p>
          <p className="text-[11px] font-medium text-muted-foreground">Total facturado</p>
        </div>
        <div className="px-4 py-3.5">
          <p className="text-lg font-semibold tabular-nums text-emerald-700 sm:text-xl">{money(totals.paid)}</p>
          <p className="text-[11px] font-medium text-muted-foreground">Total pagado</p>
        </div>
        <div className="px-4 py-3.5">
          <p className={`text-lg font-semibold tabular-nums sm:text-xl ${totals.balance > 0.005 ? 'text-amber-700' : 'text-muted-foreground'}`}>{money(totals.balance)}</p>
          <p className="text-[11px] font-medium text-muted-foreground">Saldo pendiente</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setPayDialog({ open: true, patientId: patient.id, patientName: fullName(patient) })}>
          <Plus className="mr-2 h-4 w-4" />Registrar pago
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Fecha</th>
              <th className="px-4 py-2.5 font-medium">Tratamiento</th>
              <th className="px-4 py-2.5 text-right font-medium">Monto</th>
              <th className="px-4 py-2.5 font-medium">Método</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 text-right font-medium">Recibo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id} className={`transition-colors hover:bg-muted/30 ${p.cancelled ? 'opacity-60' : ''}`}>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">{p.date ? format(parseISO(p.date), 'dd/MM/yyyy') : '—'}</td>
                <td className="px-4 py-3 font-medium">
                  <span className={p.cancelled ? 'line-through' : ''}>{p.service || '—'}</span>
                  {p.appointment_id && <span className="ml-1.5 text-[11px] text-muted-foreground">· cita</span>}
                  {p.cancelled && <p className="text-[11px] text-rose-600">Anulado: {p.cancel_reason}</p>}
                </td>
                <td className={`px-4 py-3 text-right font-semibold tabular-nums ${p.cancelled ? 'line-through text-muted-foreground' : ''}`}>{money(p.amount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{METHOD_LABELS[p.method] || p.method}</td>
                <td className="px-4 py-3">{p.cancelled ? <StatusPill status="anulado" /> : <StatusPill status={p.status} />}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Ver comprobante" onClick={() => setReceipt({ open: true, payment: p })}>
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                    {!p.cancelled && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Editar pago" onClick={() => setPayDialog({ open: true, editPayment: p })}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {!p.cancelled && can(role, 'admin') && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500 hover:text-rose-600" title="Anular pago" onClick={() => setCancelDlg({ open: true, payment: p })}>
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Sin pagos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <PaymentDialog
        open={payDialog.open}
        onOpenChange={(o) => setPayDialog((s) => ({ ...s, open: o }))}
        patientId={payDialog.patientId}
        patientName={payDialog.patientName}
        appointmentId={payDialog.appointmentId}
        service={payDialog.service}
        price={payDialog.price}
        editPayment={payDialog.editPayment}
        onSaved={(p) => setReceipt({ open: true, payment: p })}
      />
      <ReceiptDialog open={receipt.open} onOpenChange={(o) => setReceipt((s) => ({ ...s, open: o }))} payment={receipt.payment} />
      <Dialog open={cancelDlg.open} onOpenChange={(o) => setCancelDlg((s) => ({ ...s, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Anular pago</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            El pago de <span className="font-medium text-foreground">{money(cancelDlg.payment?.amount)}</span> no se eliminará: quedará marcado como anulado y la acción se registrará en el historial de actividad.
          </p>
          <Textarea rows={2} placeholder="Motivo de la anulación" value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelDlg({ open: false })}>Cerrar</Button>
            <Button variant="destructive" onClick={cancel}>Anular pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}