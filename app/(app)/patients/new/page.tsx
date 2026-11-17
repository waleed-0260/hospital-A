import { PageHeader } from "@/components/layout/PageHeader";
import { PatientForm } from "@/components/forms/PatientForm";

export default function NewPatientPage() {
  return (
    <div>
      <PageHeader
        title="Register patient"
        description="Create a new patient profile with contact and medical details."
      />
      <PatientForm />
    </div>
  );
}
