import { Label } from '@/components/ui/label';

export default function FormField({ label, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}