import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const KEYS = [['hoy', 'Hoy'], ['semana', 'Esta semana'], ['mes', 'Este mes'], ['anio', 'Este año'], ['custom', 'Personalizado']];

export default function PeriodPicker({ value, onChange }) {
  const [from, setFrom] = useState(format(new Date(), 'yyyy-MM-01'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap rounded-xl border border-border/70 bg-card p-1">
        {KEYS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => onChange(k === 'custom' ? { key: 'custom', from, to } : { key: k })}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${value.key === k ? 'bg-primary font-medium text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {l}
          </button>
        ))}
      </div>
      {value.key === 'custom' && (
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" className="w-36 bg-card" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="text-sm text-muted-foreground">→</span>
          <Input type="date" className="w-36 bg-card" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button size="sm" onClick={() => onChange({ key: 'custom', from, to })}>Aplicar</Button>
        </div>
      )}
    </div>
  );
}