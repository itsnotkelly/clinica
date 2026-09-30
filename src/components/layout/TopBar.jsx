import { Menu, LogOut, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_LABELS } from '@/lib/constants';
import GlobalSearch from '@/components/layout/GlobalSearch';

export default function TopBar({ onMenu }) {
  const { user } = useAuth();
  const name = user?.full_name || user?.email || '';
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-10">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <GlobalSearch />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-muted">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{initials}</span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-medium">{name}</span>
            <span className="block text-xs text-muted-foreground">{ROLE_LABELS[user?.role] || ''}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal text-muted-foreground">{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => (window.location.href = '/forgot-password')}>
            <KeyRound className="mr-2 h-4 w-4" /> Cambiar contraseña
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => base44.auth.logout('/login')}>
            <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}