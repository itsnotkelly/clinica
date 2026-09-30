import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money } from '@/lib/finance';

export default function PaymentChip({ group, onRegister, onAbono, onView }) {
  if (!group || group.paid <= 0.005) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-7 rounded-full px-3 text-xs hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
        onClick={onRegister}
      >
        Registrar pago
      </Button>
    );
  }
  if (group.balance > 0.005) {
    return (
      <button
        onClick={() => onAbono(group)}
        className="inline-flex h-7 items-center whitespace-nowrap rounded-full bg-amber-50 px-3 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200 transition hover:bg-amber-100"
        title="Registrar abono"
      >
        Saldo {money(group.balance)}
      </button>
    );
  }
  return (
    <button
      onClick={() => onView(group.payments[group.payments.length - 1])}
      className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 transition hover:bg-emerald-100"
      title="Ver comprobante"
    >
      <CheckCircle2 className="h-3.5 w-3.5" /> Pagado
    </button>
  );
}