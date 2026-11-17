"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Pencil,
  Stethoscope,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RescheduleForm } from "@/components/forms/RescheduleForm";
import { statusTone } from "@/lib/constants";
import { formatDate, fullName } from "@/lib/format";
import type { ReactNode } from "react";

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
        {value || "—"}
      </div>
    </div>
  );
}

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const appointment = state.appointments.find((item) => item.id === params.id);

  if (!appointment) {
    return (
      <Card>
        <EmptyState
          title="Appointment not found"
          description="This appointment may have been deleted."
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

  const patient = state.patients.find(
    (item) => item.id === appointment.patientId
  );
  const doctor = state.staff.find((item) => item.id === appointment.doctorId);
  const department = state.departments.find(
    (item) => item.id === appointment.departmentId
  );
  const relatedRecord = state.records.find(
    (record) =>
      record.patientId === appointment.patientId &&
      record.date === appointment.date
  );

  const updateStatus = (status: "Completed" | "Cancelled") => {
    dispatch({
      type: "UPDATE_APPOINTMENT",
      payload: { ...appointment, status },
    });
    toast({
      title:
        status === "Completed"
          ? "Appointment completed"
          : "Appointment cancelled",
      description: `${patient ? fullName(patient) : "Patient"} · ${formatDate(appointment.date)} at ${appointment.time}.`,
    });
  };

  const handleDelete = () => {
    dispatch({ type: "DELETE_APPOINTMENT", payload: appointment.id });
    toast({
      title: "Appointment deleted",
      description: "The appointment has been removed from the schedule.",
    });
    router.push("/appointments");
  };

  return (
    <div>
      <PageHeader
        title="Appointment details"
        description={`${formatDate(appointment.date)} at ${appointment.time} · ${appointment.type}`}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<CalendarClock className="h-4 w-4" />}
              onClick={() => setRescheduleOpen(true)}
            >
              Reschedule
            </Button>
            <Link href={`/appointments/${appointment.id}/edit`}>
              <Button icon={<Pencil className="h-4 w-4" />}>Edit</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete appointment"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(appointment.status)} dot>
                {appointment.status}
              </Badge>
              <Badge tone={statusTone(appointment.type)}>
                {appointment.type}
              </Badge>
              <Badge tone="slate">{appointment.time}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {appointment.status !== "Completed" &&
              appointment.status !== "Cancelled" ? (
                <>
                  <Button
                    size="sm"
                    variant="success"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    onClick={() => updateStatus("Completed")}
                  >
                    Mark completed
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<XCircle className="h-4 w-4" />}
                    onClick={() => updateStatus("Cancelled")}
                  >
                    Cancel
                  </Button>
                </>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Detail label="Date" value={formatDate(appointment.date)} />
            <Detail
              label="Time"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {appointment.time}
                </span>
              }
            />
            <Detail
              label="Patient"
              value={
                patient ? (
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-teal-700 hover:text-teal-800 dark:text-teal-300"
                  >
                    {fullName(patient)}
                  </Link>
                ) : (
                  "Unknown patient"
                )
              }
            />
            <Detail
              label="Doctor"
              value={
                doctor ? (
                  <Link
                    href={`/staff/${doctor.id}`}
                    className="text-teal-700 hover:text-teal-800 dark:text-teal-300"
                  >
                    Dr. {fullName(doctor)}
                  </Link>
                ) : (
                  "Unassigned"
                )
              }
            />
            <Detail label="Department" value={department?.name ?? "General"} />
            <Detail label="Reason" value={appointment.reason} />
            <div className="sm:col-span-2">
              <Detail
                label="Notes"
                value={
                  <span className="whitespace-pre-line font-normal text-slate-600 dark:text-slate-300">
                    {appointment.notes || "No additional notes."}
                  </span>
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {patient ? (
            <Card>
              <CardHeader>
                <CardTitle>Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar name={fullName(patient)} />
                  <div className="min-w-0">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                    >
                      {fullName(patient)}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {patient.mrn} · {patient.bloodGroup}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p className="inline-flex items-center gap-2">
                    <UserRound className="h-3.5 w-3.5 text-slate-400" />
                    {patient.phone}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CalendarX2 className="h-3.5 w-3.5 text-slate-400" />
                    {patient.city}
                  </p>
                </div>
                <Link
                  href={`/patients/${patient.id}`}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
                >
                  Open patient profile
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {doctor ? (
            <Card>
              <CardHeader>
                <CardTitle>Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar name={fullName(doctor)} />
                  <div className="min-w-0">
                    <Link
                      href={`/staff/${doctor.id}`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                    >
                      Dr. {fullName(doctor)}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {doctor.specialization ?? "General practice"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p className="inline-flex items-center gap-2">
                    <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                    {department?.name ?? "General"}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {doctor.shift} shift
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {relatedRecord ? (
            <Card>
              <CardHeader>
                <CardTitle>Related medical record</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {relatedRecord.diagnosis}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(relatedRecord.date)}
                </p>
                <Link
                  href={`/records/${relatedRecord.id}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
                >
                  View record
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule appointment"
        description={
          patient
            ? `${fullName(patient)} · ${doctor ? `Dr. ${fullName(doctor)}` : "Unassigned"}`
            : undefined
        }
      >
        <RescheduleForm
          appointment={appointment}
          onDone={() => setRescheduleOpen(false)}
          onCancel={() => setRescheduleOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete appointment?"
        description={`This will permanently remove the appointment on ${formatDate(appointment.date)} at ${appointment.time}.`}
        confirmLabel="Delete appointment"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
