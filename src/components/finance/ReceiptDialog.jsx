import { format, parseISO } from 'date-fns';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePayments } from '@/hooks/useClinicData';
import { METHOD_LABELS, activePayments, groupKey, money } from '@/lib/finance';

export default function ReceiptDialog({ open, onOpenChange, payment }) {
  const { data: payments = [] } = usePayments();
  if (!payment) return null;

  const sameGroup = activePayments(payments).filter(
    (p) => groupKey(p) === groupKey(payment) && p.created_date <= payment.created_date
  );
  const paidAtMoment = sameGroup.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const saldo = Math.max(0, Math.round(((Number(payment.total_price) || 0) - paidAtMoment) * 100) / 100);
  const receiptNo = payment.receipt_no || payment.id;

  const download = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const left = 16;
    let y = 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Clínica Dental Asunción', left, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120);
    y += 6;
    doc.text('Comprobante interno de pago', left, y);
    doc.setTextColor(0);
    y += 8;
    doc.setDrawColor(210);
    doc.line(left, y, 197 - 16, y);
    y += 9;
    const row = (label, value, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(11);
      doc.setTextColor(120);
      doc.text(label, left, y);
      doc.setTextColor(0);
      doc.text(String(value), 130, y);
      y += 8;
    };
    row('Recibo Nº', receiptNo);
    row('Fecha', format(parseISO(payment.date), 'dd/MM/yyyy'));
    row('Paciente', payment.patient_name || '—');
    row('Tratamiento', payment.service || '—');
    row('Método de pago', METHOD_LABELS[payment.method] || payment.method);
    row('Monto pagado', money(payment.amount), true);
    row('Saldo restante', money(saldo));
    y += 4;
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text('Comprobante interno sencillo. No constituye factura fiscal.', left, y);
    doc.save(`Recibo-${receiptNo}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Comprobante de pago</DialogTitle></DialogHeader>
        <div className="rounded-xl border border-dashed p-5 text-sm">
          <p className="font-display text-base font-semibold">Clínica Dental Asunción</p>
          <p className="text-xs text-muted-foreground">Comprobante interno de pago</p>
          <div className="my-3 border-t border-dashed" />
          <dl className="space-y-2">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Recibo Nº</dt><dd className="font-mono text-xs font-medium">{receiptNo}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Fecha</dt><dd className="font-medium">{format(parseISO(payment.date), 'dd/MM/yyyy')}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Paciente</dt><dd className="font-medium">{payment.patient_name}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Tratamiento</dt><dd className="font-medium text-right">{payment.service || '—'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Método</dt><dd className="font-medium">{METHOD_LABELS[payment.method] || payment.method}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Monto pagado</dt><dd className="font-semibold tabular-nums">{money(payment.amount)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Saldo restante</dt><dd className={`font-semibold tabular-nums ${saldo > 0.005 ? 'text-amber-700' : 'text-emerald-700'}`}>{money(saldo)}</dd></div>
          </dl>
          {payment.notes && <p className="mt-3 border-t border-dashed pt-3 text-xs text-muted-foreground">Notas: {payment.notes}</p>}
          <p className="mt-3 text-[10px] text-muted-foreground/70">Comprobante interno sencillo. No constituye factura fiscal.</p>
        </div>
        <Button onClick={download}><Download className="mr-2 h-4 w-4" />Descargar PDF</Button>
      </DialogContent>
    </Dialog>
  );
}