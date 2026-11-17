import { PageHeader } from "@/components/layout/PageHeader";
import { StaffForm } from "@/components/forms/StaffForm";

export default function NewStaffPage() {
  return (
    <div>
      <PageHeader
        title="Add staff member"
        description="Create a profile for a doctor, nurse, technician, pharmacist, or admin."
      />
      <StaffForm />
    </div>
  );
}
