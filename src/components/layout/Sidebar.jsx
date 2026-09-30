import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Armchair, UserCog, ScrollText, ShieldCheck, Wallet } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useRole } from '@/hooks/useClinicData';

const NAV = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/sala-de-espera', label: 'Sala de espera', icon: Armchair },
  { to: '/finanzas', label: 'Finanzas', icon: Wallet, roles: ['admin', 'dentista', 'recepcion'] },
  { to: '/personal', label: 'Personal y cuentas', icon: UserCog, roles: ['admin'] },
  { to: '/actividad', label: 'Registro de actividad', icon: ScrollText, roles: ['admin'] },
];

export default function Sidebar({ onNavigate }) {
  const role = useRole();
  return (
    <div className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-6">
        <Image src="https://media.base44.com/images/public/6ab835c769bf5ba996da9977/3212a9f30_image.png" alt="Clínica Dental Asunción" fittingType="fill" className="h-10 w-10 shrink-0 rounded-[14px] shadow-sm shadow-primary/20" />
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold text-foreground">Clínica Dental</p>
          <p className="font-display text-[15px] font-semibold text-primary">Asunción</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">Menú</p>
        {NAV.filter((n) => !n.roles || n.roles.includes(role)).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-accent/70 font-medium text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/75 hover:bg-muted/50 hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                <Icon className="h-[17px] w-[17px]" strokeWidth={isActive ? 2.1 : 1.7} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border/70 px-5 py-4">
        <p className="flex items-start gap-2 text-[11px] leading-snug text-muted-foreground/70">
          <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-primary/50" />
          Sistema interno. Acceso exclusivo para personal autorizado.
        </p>
      </div>
    </div>
  );
}