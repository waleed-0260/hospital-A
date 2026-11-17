"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarX2 } from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EditAppointmentPage() {
  const params = useParams<{ id: string }>();
  const { state } = useHospital();
  const appointment = state.appointments.find((item) => item.id === params.id);

  if (!appointment) {
    return (
      <Card>
        <EmptyState
          title="Appointment not found"
          description="The appointment you are trying to edit does not exist."
          icon={<CalendarX2 className="h-6 w-6" />}
          action={
            <Link href="/appointments">
              <Button size="sm">Back to appointments</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit appointment"
        description="Update the appointment details, doctor, or time slot."
      />
      <AppointmentForm appointment={appointment} />
    </div>
  );
}
