import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VIEWS = [['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes']];

const title = (view, d) => {
  if (view === 'dia') return format(d, "EEEE d 'de' MMMM yyyy", { locale: es });
  if (view === 'mes') return format(d, 'MMMM yyyy', { locale: es });
  const s = startOfWeek(d, { weekStartsOn: 1 });
  return `${format(s, 'd MMM', { locale: es })} – ${format(endOfWeek(d, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: es })}`;
};

export default function CalendarToolbar({ view, setView, date, onPrev, onNext, onToday, dentist, setDentist, dentists }) {
  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" onClick={onToday}>Hoy</Button>
        <h2 className="ml-2 text-lg font-semibold capitalize">{title(view, date)}</h2>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={dentist} onValueChange={setDentist}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los dentistas</SelectItem>
            {dentists.map((d) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex rounded-xl border bg-card p-1">
          {VIEWS.map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} className={`rounded-lg px-3.5 py-1.5 text-sm transition ${view === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}