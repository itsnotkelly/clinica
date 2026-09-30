import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from '@/components/patients/FormField';
import { base44 } from '@/api/base44Client';
import { logAction } from '@/lib/audit';
import { usePayments } from '@/hooks/useClinicData';
import { METHOD_LABELS, PAYMENT_STATUS, activePayments, genReceiptNo, money, statusFor } from '@/lib/finance';

export default function PaymentDialog({ open, onOpenChange, appointment, patientId, patientName, appointmentId, service, price, editPayment, onSaved }) {
  const qc = useQueryClient();
  const { data: payments = [] } = usePayments();
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!open) return;
    setError('');
    if (editPayment) {
      setForm({ ...editPayment });
    } else {
      setForm({
        patient_id: appointment?.patient_id || patientId || '',
        patient_name: appointment?.patient_name || patientName || '',
        appointment_id: appointment?.id || appointmentId || null,
        service: appointment?.reason || service || '',
        total_price: price ?? '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        method: 'efectivo',
        notes: '',
      });
    }
  }, [open, editPayment, appointment]);

  const others = activePayments(payments).filter(
    (p) => p.id !== editPayment?.id && form.appointment_id && p.appointment_id === form.appointment_id
  );
  const paidBefore = Math.round(others.reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100;
  const priceN = Number(form.total_price) || 0;
  const amountN = Number(form.amount) || 0;
  const saldoActual = Math.max(0, priceN - paidBefore);
  const after = Math.max(0, priceN - (paidBefore + amountN));
  const st = PAYMENT_STATUS[statusFor(paidBefore + amountN, priceN)];

  const save = async () => {
    if (!form.patient_id) return setError('Falta el paciente.');
    if (!form.date) return setError('Indique la fecha del pago.');
    if (!amountN || amountN <= 0) return setError('El monto pagado debe ser mayor a cero.');
    if (paidBefore + amountN > priceN + 0.005) return setError('El monto supera el saldo del servicio.');
    setSaving(true);
    const data = {
      patient_id: form.patient_id,
      patient_name: form.patient_name,
      appointment_id: form.appointment_id || null,
      service: form.service || 'Servicio',
      total_price: priceN,
      amount: amountN,
      date: form.date,
      method: form.method || 'efectivo',
      notes: form.notes || '',
      status: statusFor(paidBefore + amountN, priceN),
    };
    let saved;
    if (editPayment) {
      saved = await base44.entities.Payment.update(editPayment.id, data);
      await logAction('Modificación de pago', 'Payment', editPayment.id, `${data.patient_name} · ${data.service} · ${money(amountN)} (${METHOD_LABELS[data.method]})`);
    } else {
      saved = await base44.entities.Payment.create({ ...data, receipt_no: genReceiptNo() });
      await logAction('Registro de pago', 'Payment', saved.id, `${data.patient_name} · ${data.service} · ${money(amountN)} (${METHOD_LABELS[data.method]})`);
    }
    await qc.invalidateQueries({ queryKey: ['payments'] });
    setSaving(false);
    onOpenChange(false);
    onSaved?.(saved);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editPayment ? 'Editar pago' : 'Registrar pago'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm">
            <p className="font-medium">{form.patient_name || '—'}</p>
            <p className="text-xs text-muted-foreground">
              {form.appointment_id ? `Cita relacionada · ${form.service || 'Sin tratamiento'}` : form.service || 'Pago sin cita relacionada'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Fecha del pago *">
              <Input id="pay-date" type="date" value={form.date || ''} onChange={(e) => set('date', e.target.value)} />
            </FormField>
            <FormField label="Método de pago *">
              <Select value={form.method || 'efectivo'} onValueChange={(v) => set('method', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(METHOD_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Tratamiento o servicio">
            <Input id="pay-service" value={form.service || ''} onChange={(e) => set('service', e.target.value)} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Precio total del servicio *">
              <Input id="pay-price" type="number" min="0" step="0.01" value={form.total_price ?? ''} onChange={(e) => set('total_price', e.target.value)} />
            </FormField>
            <FormField label="Monto pagado ahora *">
              <div className="flex gap-2">
                <Input id="pay-amount" type="number" min="0" step="0.01" value={form.amount ?? ''} onChange={(e) => set('amount', e.target.value)} />
                {saldoActual > 0.005 && (
                  <Button type="button" size="sm" variant="secondary" className="shrink-0" onClick={() => set('amount', String(saldoActual))}>
                    Saldo
                  </Button>
                )}
              </div>
            </FormField>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Pagado antes: <span className="font-medium text-foreground tabular-nums">{money(paidBefore)}</span>
            </span>
            <span className="text-muted-foreground">
              Saldo después de este pago: <span className="font-semibold text-foreground tabular-nums">{money(after)}</span>
            </span>
            <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${st.cls}`}>{st.label}</span>
          </div>
          <FormField label="Notas">
            <Textarea id="pay-notes" rows={2} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} />
          </FormField>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={saving} onClick={save}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}