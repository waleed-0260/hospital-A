"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { UserRound } from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { PatientForm } from "@/components/forms/PatientForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EditPatientPage() {
  const params = useParams<{ id: string }>();
  const { state } = useHospital();
  const patient = state.patients.find((item) => item.id === params.id);

  if (!patient) {
    return (
      <Card>
        <EmptyState
          title="Patient not found"
          description="The patient you are trying to edit does not exist."
          icon={<UserRound className="h-6 w-6" />}
          action={
            <Link href="/patients">
              <Button size="sm">Back to patients</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit patient"
        description={`Update the profile for ${patient.firstName} ${patient.lastName} (${patient.mrn}).`}
      />
      <PatientForm patient={patient} />
    </div>
  );
}
