import { Link } from 'react-router-dom';
import { UserPlus, CalendarPlus, Search, Armchair, ArrowRight } from 'lucide-react';

const Action = ({ icon: Icon, label, ...props }) => {
  const cls = 'group flex w-full items-center gap-3 rounded-xl bg-card/70 px-3 py-2.5 text-sm font-medium shadow-sm shadow-primary/[0.03] transition-all hover:bg-card hover:shadow-md hover:shadow-primary/[0.06]';
  const inner = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-accent/70">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="flex-1 text-left">{label}</span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
    </>
  );
  return props.to ? <Link to={props.to} className={cls}>{inner}</Link> : <button onClick={props.onClick} className={cls}>{inner}</button>;
};

export default function QuickActions({ onNewAppointment }) {
  return (
    <aside className="h-fit rounded-2xl bg-accent/40 p-4 lg:sticky lg:top-6">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Acciones rápidas</h2>
      <div className="mt-3 space-y-2">
        <Action icon={UserPlus} label="Nuevo paciente" to="/pacientes/nuevo" />
        <Action icon={CalendarPlus} label="Nueva cita" onClick={onNewAppointment} />
        <Action icon={Search} label="Buscar paciente" to="/pacientes" />
        <Action icon={Armchair} label="Sala de espera" to="/sala-de-espera" />
      </div>
    </aside>
  );
}