import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { money } from '@/lib/finance';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const tooltipStyle = { borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 };
const fmt = (v) => money(v);

const ChartCard = ({ title, children }) => (
  <div className="rounded-2xl border border-border/70 bg-card p-5">
    <h3 className="mb-4 text-sm font-semibold">{title}</h3>
    {children}
  </div>
);

const Empty = () => <p className="flex h-[170px] items-center justify-center text-xs text-muted-foreground">Sin datos en este período</p>;

const DonutCard = ({ title, data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard title={title}>
      {total <= 0 ? <Empty /> : (
        <div className="flex items-center gap-5">
          <ResponsiveContainer width="45%" height={160}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={68} paddingAngle={2} strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={fmt} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex-1 space-y-2 text-xs">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="truncate text-muted-foreground">{d.name}</span>
                </span>
                <span className="font-medium tabular-nums">{money(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
};

export default function IncomeCharts({ week, year, services, methods }) {
  const weekHasData = week.some((d) => d.total > 0);
  const yearHasData = year.some((d) => d.total > 0);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Ingresos por día · esta semana">
        {!weekHasData ? <Empty /> : (
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={week} margin={{ top: 4, right: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={44} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={fmt} contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.4 }} />
              <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <ChartCard title="Ingresos por mes · este año">
        {!yearHasData ? <Empty /> : (
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={year} margin={{ top: 4, right: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={44} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={fmt} contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.4 }} />
              <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <DonutCard title="Ingresos por tratamiento" data={services} />
      <DonutCard title="Distribución por método de pago" data={methods} />
    </div>
  );
}