import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useAppointments, useRole, todayStr } from '@/hooks/useClinicData';
import { can, fullName } from '@/lib/constants';
import { patientStats } from '@/components/patients/patientStats';
import RecordHeader from '@/components/record/RecordHeader';
import InfoTab from '@/components/record/InfoTab';
import AppointmentsTab from '@/components/record/AppointmentsTab';
import ClinicalTab from '@/components/record/ClinicalTab';
import PaymentsTab from '@/components/record/PaymentsTab';
import PatientEditDialog from '@/components/record/PatientEditDialog';
import AppointmentDialog from '@/components/appointments/AppointmentDialog';

export default function PatientRecord() {
  const { id } = useParams();
  const role = useRole();
  const { data: patient, isLoading } = useQuery({ queryKey: ['patient', id], queryFn: () => base44.entities.Patient.get(id) });
  const { data: appts = [] } = useAppointments();
  const [edit, setEdit] = useState(false);
  const [apptDialog, setApptDialog] = useState({ open: false });

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Cargando expediente…</p>;
  if (!patient) return <p className="p-6 text-sm text-muted-foreground">Paciente no encontrado.</p>;

  const { mine, next, last } = patientStats(id, appts, todayStr());
  const newAppt = () => setApptDialog({ open: true, defaults: { patient_id: id, patient_name: fullName(patient) } });

  return (
    <div className="space-y-6">
      <Link to="/pacientes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Pacientes
      </Link>
      <RecordHeader patient={patient} next={next} last={last} onEdit={() => setEdit(true)} onNewAppt={newAppt} />
      <Tabs defaultValue="info">
        <TabsList className="h-auto flex-wrap bg-muted/70">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="citas">Citas ({mine.length})</TabsTrigger>
          {can(role, 'finance') && <TabsTrigger value="pagos">Pagos</TabsTrigger>}
          <TabsTrigger value="clinica" className="gap-1.5">Información clínica {!can(role, 'clinical') && <Lock className="h-3 w-3" />}</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4"><InfoTab patient={patient} /></TabsContent>
        <TabsContent value="citas" className="mt-4">
          <AppointmentsTab appts={mine} onOpen={(a) => setApptDialog({ open: true, appointment: a })} />
        </TabsContent>
        {can(role, 'finance') && (
          <TabsContent value="pagos" className="mt-4">
            <PaymentsTab patient={patient} />
          </TabsContent>
        )}
        <TabsContent value="clinica" className="mt-4">
          {can(role, 'clinical')
            ? <ClinicalTab patientId={id} patientName={fullName(patient)} />
            : <p className="flex items-center gap-2 rounded-2xl border bg-card p-8 text-sm text-muted-foreground"><Lock className="h-4 w-4" />Su rol no tiene acceso a la información clínica.</p>}
        </TabsContent>
      </Tabs>
      <PatientEditDialog open={edit} onOpenChange={setEdit} patient={patient} />
      <AppointmentDialog open={apptDialog.open} onOpenChange={(o) => setApptDialog((s) => ({ ...s, open: o }))} appointment={apptDialog.appointment} defaults={apptDialog.defaults} />
    </div>
  );
}