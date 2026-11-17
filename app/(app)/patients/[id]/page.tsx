"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarPlus,
  ChevronRight,
  Droplets,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserRound,
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
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { statusTone } from "@/lib/constants";
import { calcAge, formatCurrency, formatDate, fullName } from "@/lib/format";
import type { ReactNode } from "react";

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patient = state.patients.find((item) => item.id === params.id);

  if (!patient) {
    return (
      <Card>
        <EmptyState
          title="Patient not found"
          description="This patient may have been deleted. Return to the patient list to continue."
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

  const appointments = [...state.appointments]
    .filter((item) => item.patientId === patient.id)
    .sort(
      (left, right) =>
        new Date(`${right.date}T${right.time}`).getTime() -
        new Date(`${left.date}T${left.time}`).getTime()
    );
  const records = [...state.records]
    .filter((item) => item.patientId === patient.id)
    .sort(
      (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
    );
  const invoices = [...state.invoices]
    .filter((item) => item.patientId === patient.id)
    .sort(
      (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
    );
  const bed = state.beds.find((item) => item.patientId === patient.id);
  const ward = bed ? state.wards.find((item) => item.id === bed.wardId) : undefined;
  const latestRecord = records[0];
  const doctorName = (id: string) => {
    const doctor = state.staff.find((member) => member.id === id);
    return doctor ? `Dr. ${fullName(doctor)}` : "Unassigned";
  };
  const departmentName = (id: string) =>
    state.departments.find((department) => department.id === id)?.name ??
    "General";
  const outstanding = invoices.reduce(
    (sum, invoice) => sum + Math.max(0, invoice.total - invoice.paid),
    0
  );

  const handleDelete = () => {
    dispatch({ type: "DELETE_PATIENT", payload: patient.id });
    toast({
      title: "Patient deleted",
      description: `${fullName(patient)} and related records were removed.`,
    });
    router.push("/patients");
  };

  const handleDischarge = () => {
    dispatch({ type: "DISCHARGE_PATIENT", payload: { patientId: patient.id } });
    toast({
      title: "Patient discharged",
      description: `${fullName(patient)} has been discharged and the bed is now available.`,
    });
  };

  return (
    <div>
      <PageHeader
        title={fullName(patient)}
        description={`${patient.mrn} · Registered ${formatDate(patient.registeredAt)}`}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<CalendarPlus className="h-4 w-4" />}
              onClick={() => router.push("/appointments/new")}
            >
              New appointment
            </Button>
            <Link href={`/patients/${patient.id}/edit`}>
              <Button icon={<Pencil className="h-4 w-4" />}>Edit patient</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete patient"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        }
      />

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={fullName(patient)} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {fullName(patient)}
              </h2>
              <Badge tone={statusTone(patient.status)} dot>
                {patient.status}
              </Badge>
              <Badge tone="red">{patient.bloodGroup}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                {patient.gender} · {calcAge(patient.dob)} years
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {patient.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {patient.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {patient.city}
              </span>
            </div>
          </div>
          {bed && ward ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900/60 dark:bg-amber-950/30">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Currently admitted
              </p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {ward.name} · Bed {bed.bedNumber}
              </p>
              {bed.admittedAt ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Since {formatDate(bed.admittedAt)}
                </p>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={handleDischarge}
              >
                Discharge patient
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Tabs
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "appointments", label: "Appointments", count: appointments.length },
          { value: "records", label: "Medical records", count: records.length },
          { value: "billing", label: "Billing", count: invoices.length },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-5 w-fit"
      />

      {tab === "overview" ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={<UserRound className="h-4 w-4" />}
                label="Full name"
                value={fullName(patient)}
              />
              <InfoRow
                icon={<Droplets className="h-4 w-4" />}
                label="Blood group"
                value={patient.bloodGroup}
              />
              <InfoRow
                icon={<UserRound className="h-4 w-4" />}
                label="Date of birth"
                value={`${formatDate(patient.dob)} (${calcAge(patient.dob)} yrs)`}
              />
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={patient.phone}
              />
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={patient.email}
              />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="City"
                value={patient.city}
              />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Address"
                value={patient.address}
              />
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Emergency contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow
                  icon={<UserRound className="h-4 w-4" />}
                  label="Contact name"
                  value={patient.emergencyContactName}
                />
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Contact phone"
                  value={patient.emergencyContactPhone}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insurance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow
                  icon={<UserRound className="h-4 w-4" />}
                  label="Provider"
                  value={patient.insuranceProvider ?? "Self-pay"}
                />
                <InfoRow
                  icon={<UserRound className="h-4 w-4" />}
                  label="Policy number"
                  value={patient.insuranceNumber}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Medical alerts & latest vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No known allergies.
                  </p>
                ) : (
                  patient.allergies.map((allergy) => (
                    <Badge key={allergy} tone="red">
                      {allergy}
                    </Badge>
                  ))
                )}
              </div>
              {latestRecord ? (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Vitals from {formatDate(latestRecord.date)}
                  </p>
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      ["Blood pressure", latestRecord.vitals.bp],
                      ["Heart rate", latestRecord.vitals.heartRate],
                      ["Temperature", latestRecord.vitals.temperature],
                      ["Weight", latestRecord.vitals.weight],
                      ["Height", latestRecord.vitals.height],
                      ["SpO₂", latestRecord.vitals.spo2],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
                      >
                        <dt className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {label}
                        </dt>
                        <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  No medical records yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              {latestRecord ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Diagnosis
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {latestRecord.diagnosis}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Treatment
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {latestRecord.treatment}
                    </p>
                  </div>
                  <Link
                    href={`/records/${latestRecord.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
                  >
                    Open record
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No diagnosis recorded.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "appointments" ? (
        <Card>
          <CardHeader>
            <CardTitle>Appointment history</CardTitle>
            <Link
              href="/appointments/new"
              className="text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
            >
              Book appointment
            </Link>
          </CardHeader>
          {appointments.length === 0 ? (
            <EmptyState
              title="No appointments"
              description="This patient has no scheduled or past appointments."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <Link
                    href={`/appointments/${appointment.id}`}
                    className="flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="w-32 shrink-0 text-sm">
                      <span className="block font-semibold text-slate-900 dark:text-white">
                        {formatDate(appointment.date)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {appointment.time}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                        {departmentName(appointment.departmentId)}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {doctorName(appointment.doctorId)} · {appointment.type}
                      </span>
                    </span>
                    <Badge tone={statusTone(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {tab === "records" ? (
        <Card>
          <CardHeader>
            <CardTitle>Medical records</CardTitle>
            <Link
              href="/records/new"
              className="text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
            >
              New record
            </Link>
          </CardHeader>
          {records.length === 0 ? (
            <EmptyState
              title="No medical records"
              description="Create a clinical record after the patient's next visit."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((record) => (
                <li key={record.id}>
                  <Link
                    href={`/records/${record.id}`}
                    className="flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="w-32 shrink-0 text-sm">
                      <span className="block font-semibold text-slate-900 dark:text-white">
                        {formatDate(record.date)}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {doctorName(record.doctorId)}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                        {record.diagnosis}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {record.symptoms}
                      </span>
                    </span>
                    <Badge tone="blue">
                      {record.prescriptions.length} Rx
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {tab === "billing" ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Invoices</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Outstanding balance: {formatCurrency(outstanding)}
              </p>
            </div>
            <Link
              href="/billing/new"
              className="text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
            >
              New invoice
            </Link>
          </CardHeader>
          {invoices.length === 0 ? (
            <EmptyState
              title="No invoices"
              description="Billing has not been created for this patient yet."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/billing/${invoice.id}`}
                    className="flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {invoice.invoiceNo}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        Issued {formatDate(invoice.date)} · Due{" "}
                        {formatDate(invoice.dueDate)}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(invoice.total)}
                    </span>
                    <Badge tone={statusTone(invoice.status)}>
                      {invoice.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete patient?"
        description={`This will permanently remove ${fullName(patient)} and all related appointments, records, lab tests, and invoices. This action cannot be undone.`}
        confirmLabel="Delete patient"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
