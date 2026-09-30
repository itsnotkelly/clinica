import { Wallet, CreditCard, Sigma, Stethoscope, AlertCircle } from 'lucide-react';
import { money } from '@/lib/finance';

export default function SummaryCards({ received, count, avg, done, pending }) {
  const cells = [
    { label: 'Total recibido', value: money(received), icon: Wallet, tint: 'bg-primary/10 text-primary' },
    { label: 'Pagos recibidos', value: count, icon: CreditCard, tint: 'bg-emerald-50 text-emerald-600' },
    { label: 'Promedio por pago', value: money(avg), icon: Sigma, tint: 'bg-sky-50 text-sky-600' },
    { label: 'Servicios realizados', value: done, icon: Stethoscope, tint: 'bg-slate-100 text-slate-500' },
    { label: 'Saldo pendiente', value: money(pending), icon: AlertCircle, tint: 'bg-amber-50 text-amber-600' },
  ];
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border/70 bg-card sm:grid-cols-3 xl:grid-cols-5 xl:divide-x xl:divide-border/60">
      {cells.map(({ label, value, icon: Icon, tint }) => (
        <div key={label} className="flex items-center gap-3 px-4 py-3.5">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tint}`}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold leading-tight tabular-nums tracking-tight sm:text-xl">{value}</p>
            <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}