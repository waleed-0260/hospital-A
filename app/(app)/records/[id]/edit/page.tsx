"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText } from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { RecordForm } from "@/components/forms/RecordForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EditRecordPage() {
  const params = useParams<{ id: string }>();
  const { state } = useHospital();
  const record = state.records.find((item) => item.id === params.id);

  if (!record) {
    return (
      <Card>
        <EmptyState
          title="Medical record not found"
          description="The record you are trying to edit does not exist."
          icon={<FileText className="h-6 w-6" />}
          action={
            <Link href="/records">
              <Button size="sm">Back to records</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit medical record"
        description="Update clinical findings, vitals, and prescriptions."
      />
      <RecordForm record={record} />
    </div>
  );
}
