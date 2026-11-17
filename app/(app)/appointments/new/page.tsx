import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentForm } from "@/components/forms/AppointmentForm";

export default function NewAppointmentPage() {
  return (
    <div>
      <PageHeader
        title="New appointment"
        description="Book a patient consultation with an available doctor and time slot."
      />
      <AppointmentForm />
    </div>
  );
}
