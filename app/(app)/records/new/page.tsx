import { PageHeader } from "@/components/layout/PageHeader";
import { RecordForm } from "@/components/forms/RecordForm";

export default function NewRecordPage() {
  return (
    <div>
      <PageHeader
        title="New medical record"
        description="Document the consultation, vitals, diagnosis, and prescriptions."
      />
      <RecordForm />
    </div>
  );
}
