"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { UserRound } from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { StaffForm } from "@/components/forms/StaffForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EditStaffPage() {
  const params = useParams<{ id: string }>();
  const { state } = useHospital();
  const member = state.staff.find((item) => item.id === params.id);

  if (!member) {
    return (
      <Card>
        <EmptyState
          title="Staff member not found"
          description="The staff profile you are trying to edit does not exist."
          icon={<UserRound className="h-6 w-6" />}
          action={
            <Link href="/staff">
              <Button size="sm">Back to staff</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit staff member"
        description={`Update the profile for ${member.firstName} ${member.lastName} (${member.employeeId}).`}
      />
      <StaffForm member={member} />
    </div>
  );
}
