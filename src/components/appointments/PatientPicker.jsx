import { useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { usePatients } from '@/hooks/useClinicData';
import { fullName } from '@/lib/constants';

export default function PatientPicker({ value, onChange }) {
  const { data: patients = [] } = usePatients();
  const [open, setOpen] = useState(false);
  const selected = patients.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          {selected ? fullName(selected) : <span className="text-muted-foreground">Seleccionar paciente</span>}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Nombre, teléfono o ID…" />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup>
              {patients.map((p) => (
                <CommandItem key={p.id} value={`${fullName(p)} ${p.phone || ''} ${p.patient_code || ''} ${p.id}`} onSelect={() => { onChange(p); setOpen(false); }}>
                  <span className="flex-1">{fullName(p)}</span>
                  <span className="text-xs text-muted-foreground">{p.phone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}