import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { money } from '@/lib/finance';
import { INACTIVE, normalize } from '@/lib/constants';

export default function PendingPayments({ groups, appts, onAbono }) {
  const [q, setQ] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');
  const n = normalize(q);
  const rows = groups.filter((g) => !n || normalize(g.patient_name).includes(n) || normalize(g.service).includes(n));
  const nextOf = (pid) =>
    appts
      .filter((a) => a.patient_id === pid && a.date >= today && !INACTIVE.includes(a.status))
      .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time))[0];

  return (
    <div className="space-y-3">
      <Input className="max-w-sm bg-card" placeholder="Buscar paciente o tratamiento" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Paciente</th>
              <th className="px-4 py-2.5 font-medium">Tratamiento</th>
              <th className="px-4 py-2.5 text-right font-medium">Precio</th>
              <th className="px-4 py-2.5 text-right font-medium">Pagado</th>
              <th className="px-4 py-2.5 text-right font-medium">Saldo</th>
              <th className="px-4 py-2.5 font-medium">Último pago</th>
              <th className="px-4 py-2.5 font-medium">Próxima cita</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((g) => {
              const next = nextOf(g.patient_id);
              return (
                <tr key={g.key} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{g.patient_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{g.service}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(g.price)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{money(g.paid)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-amber-700">{money(g.balance)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{g.last_date ? format(parseISO(g.last_date), 'dd/MM/yyyy') : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{next ? `${format(parseISO(next.date), 'dd/MM')} · ${next.start_time}` : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" className="h-7 rounded-full px-3 text-xs hover:border-primary/40 hover:bg-accent hover:text-accent-foreground" onClick={() => onAbono(g)}>
                      Registrar abono
                    </Button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Sin saldos pendientes.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}