"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Mail,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { statusTone } from "@/lib/constants";
import { formatDate, fullName } from "@/lib/format";

export default function StaffDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const member = state.staff.find((item) => item.id === params.id);

  if (!member) {
    return (
      <Card>
        <EmptyState
          title="Staff member not found"
          description="This staff profile may have been removed."
          icon={<Stethoscope className="h-6 w-6" />}
          action={
            <Link href="/staff">
              <Button size="sm">Back to staff</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const department = state.departments.find(
    (item) => item.id === member.departmentId
  );
  const appointments = state.appointments
    .filter((appointment) => appointment.doctorId === member.id)
    .sort(
      (left, right) =>
        new Date(`${left.date}T${left.time}`).getTime() -
        new Date(`${right.date}T${right.time}`).getTime()
    );
  const upcoming = appointments
    .filter(
      (appointment) =>
        appointment.date >= new Date().toISOString().slice(0, 10) &&
        appointment.status === "Scheduled"
    )
    .slice(0, 5);
  const records = state.records.filter((record) => record.doctorId === member.id);
  const labTests = state.labTests.filter((test) => test.doctorId === member.id);

  const handleDelete = () => {
    dispatch({ type: "DELETE_STAFF", payload: member.id });
    toast({
      title: "Staff member removed",
      description: `${fullName(member)} and their assignments were removed.`,
    });
    router.push("/staff");
  };

  return (
    <div>
      <PageHeader
        title={member.role === "Doctor" ? `Dr. ${fullName(member)}` : fullName(member)}
        description={`${member.employeeId} · ${member.role} · ${department?.name ?? "Unassigned"}`}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<CalendarDays className="h-4 w-4" />}
              onClick={() => router.push("/appointments/new")}
            >
              Schedule appointment
            </Button>
            <Link href={`/staff/${member.id}/edit`}>
              <Button icon={<Pencil className="h-4 w-4" />}>Edit</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete staff member"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        }
      />

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={fullName(member)} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {member.role === "Doctor" ? "Dr. " : ""}
                {fullName(member)}
              </h2>
              <Badge tone={statusTone(member.role)}>{member.role}</Badge>
              <Badge tone={statusTone(member.status)} dot>
                {member.status}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5" />
                {member.specialization ?? member.role}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {member.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {member.email}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upcoming appointments
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {upcoming.length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Records authored
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {records.length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
            <FlaskConical className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lab tests ordered
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {labTests.length}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Employment details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Employee ID
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {member.employeeId}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Role
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {member.role}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Department
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {department?.name ?? "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Specialization
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {member.specialization ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Shift
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {member.shift}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Joined
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(member.joinDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phone
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {member.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Email
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {member.email}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming appointments</CardTitle>
              <Link
                href="/appointments"
                className="text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
              >
                View all
              </Link>
            </CardHeader>
            {upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming appointments"
                description="This staff member has no scheduled appointments."
                icon={<CalendarDays className="h-6 w-6" />}
              />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcoming.map((appointment) => {
                  const patient = state.patients.find(
                    (item) => item.id === appointment.patientId
                  );
                  return (
                    <li key={appointment.id}>
                      <Link
                        href={`/appointments/${appointment.id}`}
                        className="flex flex-wrap items-center gap-3 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <span className="w-32 shrink-0">
                          <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                            {formatDate(appointment.date)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {appointment.time}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">
                          {patient ? fullName(patient) : "Unknown patient"}
                        </span>
                        <Badge tone="blue">{appointment.type}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Department</CardTitle>
          </CardHeader>
          <CardContent>
            {department ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {department.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {department.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {department.location}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {department.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No department assigned.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove staff member?"
        description={`This will remove ${fullName(member)} and unassign their appointments, records, and lab tests. This action cannot be undone.`}
        confirmLabel="Remove staff"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
