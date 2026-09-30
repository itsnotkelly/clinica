import { money } from '@/lib/finance';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function BreakdownTables({ services, methods }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold">Desglose por tratamiento</h3>
          <p className="text-xs text-muted-foreground">Ingresos recibidos en el período seleccionado</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2 font-medium">Tratamiento</th>
              <th className="px-2 py-2 text-center font-medium">Veces</th>
              <th className="px-5 py-2 text-right font-medium">Recibido</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map((s) => (
              <tr key={s.service}>
                <td className="px-5 py-2.5 font-medium">{s.service}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">{s.count}</td>
                <td className="px-5 py-2.5 text-right font-semibold tabular-nums">{money(s.total)}</td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">Sin servicios en este período</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl border border-border/70 bg-card">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold">Métodos de pago</h3>
          <p className="text-xs text-muted-foreground">Distribución del período seleccionado</p>
        </div>
        <div className="px-5 pb-5">
          {methods.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin pagos en este período</p>}
          {methods.map((m, i) => (
            <div key={m.method} className="flex items-center justify-between border-t border-border/50 py-3 text-sm first:border-t-0">
              <span className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {m.label}
              </span>
              <span className="font-semibold tabular-nums">{money(m.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}