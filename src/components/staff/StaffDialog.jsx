import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from '@/components/patients/FormField';
import { base44 } from '@/api/base44Client';
import { logAction } from '@/lib/audit';

export const STAFF_ROLE_LABELS = { administrador: 'Administrador', recepcion: 'Recepción', dentista: 'Dentista', asistente: 'Asistente' };

export default function StaffDialog({ open, onOpenChange, member }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm(member || { role: 'dentista', active: true });
      setConfirmDelete(false);
    }
  }, [open]);

  const save = async () => {
    if (!form.full_name) return;
    setSaving(true);
    const data = { full_name: form.full_name, role: form.role, specialty: form.specialty || '', schedule: form.schedule || '', email: form.email || '', active: form.active !== false };
    const id = member ? (await base44.entities.Staff.update(member.id, data), member.id) : (await base44.entities.Staff.create(data)).id;
    await logAction(member ? 'Modificación de personal' : 'Alta de personal', 'Staff', id, data.full_name);
    await qc.invalidateQueries({ queryKey: ['staff'] });
    setSaving(false);
    onOpenChange(false);
  };

  const remove = async () => {
    if (!member) return;
    setSaving(true);
    await base44.entities.Staff.delete(member.id);
    await logAction('Eliminación de personal', 'Staff', member.id, member.full_name);
    await qc.invalidateQueries({ queryKey: ['staff'] });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{member ? 'Editar miembro del personal' : 'Nuevo miembro del personal'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre completo *" className="sm:col-span-2"><Input value={form.full_name || ''} onChange={(e) => set('full_name', e.target.value)} /></FormField>
          <FormField label="Rol">
            <Select value={form.role} onValueChange={(v) => set('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(STAFF_ROLE_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Especialidad"><Input value={form.specialty || ''} onChange={(e) => set('specialty', e.target.value)} /></FormField>
          <FormField label="Horario / disponibilidad" className="sm:col-span-2"><Input placeholder="Ej. Lun–Vie 8:00–16:00" value={form.schedule || ''} onChange={(e) => set('schedule', e.target.value)} /></FormField>
          <FormField label="Correo"><Input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} /></FormField>
          <label className="flex items-center gap-3 self-end pb-2 text-sm"><Switch checked={form.active !== false} onCheckedChange={(v) => set('active', v)} />Activo</label>
        </div>
        <DialogFooter>
          {member && (
            <Button variant="destructive" className="mr-auto" disabled={saving} onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))}>
              {confirmDelete ? 'Confirmar eliminación' : 'Eliminar'}
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={saving || !form.full_name} onClick={save}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}