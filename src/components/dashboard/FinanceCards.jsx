import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { usePayments } from '@/hooks/useClinicData';
import { activePayments, money, pendingGroups, periodRange } from '@/lib/finance';
import { format, isWithinInterval, parseISO } from 'date-fns';

export default function FinanceCards() {
  const { data: payments = [] } = usePayments();
  const active = activePayments(payments);
  const today = format(new Date(), 'yyyy-MM-dd');
  const week = periodRange('semana');
  const month = format(new Date(), 'yyyy-MM');
  const received = (fn) => Math.round(active.filter(fn).reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100;
  const pending = Math.round(pendingGroups(payments).reduce((s, g) => s + g.balance, 0) * 100) / 100;

  const items = [
    { label: 'Ingresos de hoy', value: received((p) => p.date === today) },
    { label: 'Esta semana', value: received((p) => { try { return isWithinInterval(parseISO(p.date), week); } catch { return false; } }) },
    { label: 'Este mes', value: received((p) => p.date?.startsWith(month)) },
    { label: 'Pendiente de cobro', value: pending, warn: true },
  ];

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-5 py-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">Finanzas</p>
        <div className="mt-2 flex flex-wrap gap-x-9 gap-y-2">
          {items.map(({ label, value, warn }) => (
            <div key={label}>
              <p className={`text-lg font-semibold tabular-nums tracking-tight ${warn && value > 0.005 ? 'text-amber-700' : ''}`}>{money(value)}</p>
              <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <Link to="/finanzas" className="group flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary transition hover:bg-accent/70">
        Ver finanzas
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}