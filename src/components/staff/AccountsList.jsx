import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_LABELS } from '@/lib/constants';
import { logAction } from '@/lib/audit';

export default function AccountsList() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const changeRole = async (u, role) => {
    await base44.entities.User.update(u.id, { role });
    await logAction('Cambio de permisos', 'User', u.id, `${u.email}: ${ROLE_LABELS[u.role] || u.role} → ${ROLE_LABELS[role]}`);
    qc.invalidateQueries({ queryKey: ['users'] });
  };

  const invite = async (e) => {
    e.preventDefault();
    setSending(true);
    setMsg('');
    try {
      await base44.users.inviteUser(email, 'user');
      await logAction('Invitación de usuario', 'User', '', email);
      setMsg('Invitación enviada. Cuando la persona cree su cuenta, asígnele su rol aquí.');
      setEmail('');
      qc.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      setMsg(err.message || 'No se pudo enviar la invitación.');
    }
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={invite} className="rounded-2xl border bg-card p-5">
        <p className="font-medium">Invitar a un miembro del personal</p>
        <p className="mb-3 text-sm text-muted-foreground">Cada persona debe tener su propia cuenta. No comparta contraseñas.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input type="email" required placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" disabled={sending}>{sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Invitar</Button>
        </div>
        {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
      </form>
      <div className="divide-y rounded-2xl border bg-card">
        {isLoading && <p className="p-5 text-sm text-muted-foreground">Cargando…</p>}
        {users.map((u) => (
          <div key={u.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">{u.full_name || '—'}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <Select value={u.role || 'user'} onValueChange={(v) => changeRole(u, v)} disabled={u.id === me?.id}>
              <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(ROLE_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}