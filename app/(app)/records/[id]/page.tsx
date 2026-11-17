"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarPlus,
  ChevronRight,
  ClipboardList,
  FileText,
  Pencil,
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
import { formatDate, fullName } from "@/lib/format";

export default function RecordDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const record = state.records.find((item) => item.id === params.id);

  if (!record) {
    return (
      <Card>
        <EmptyState
          title="Medical record not found"
          description="This record may have been deleted."
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

  const patient = state.patients.find((item) => item.id === record.patientId);
  const doctor = state.staff.find((item) => item.id === record.doctorId);

  const handleDelete = () => {
    dispatch({ type: "DELETE_RECORD", payload: record.id });
    toast({
      title: "Medical record deleted",
      description: "The clinical record has been removed.",
    });
    router.push("/records");
  };

  const vitals: Array<[string, string]> = [
    ["Blood pressure", record.vitals.bp],
    ["Heart rate", record.vitals.heartRate],
    ["Temperature", record.vitals.temperature],
    ["Weight", record.vitals.weight],
    ["Height", record.vitals.height],
    ["SpO₂", record.vitals.spo2],
  ];

  return (
    <div>
      <PageHeader
        title="Medical record"
        description={`${formatDate(record.date)} · ${
          patient ? fullName(patient) : "Unknown patient"
        }`}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<CalendarPlus className="h-4 w-4" />}
              onClick={() => router.push("/appointments/new")}
            >
              Book follow-up
            </Button>
            <Link href={`/records/${record.id}/edit`}>
              <Button icon={<Pencil className="h-4 w-4" />}>Edit</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete record"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Clinical assessment</CardTitle>
              <Badge tone="slate">
                {record.prescriptions.length} prescription
                {record.prescriptions.length === 1 ? "" : "s"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Diagnosis
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  {record.diagnosis}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Symptoms
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                  {record.symptoms}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Treatment plan
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                  {record.treatment}
                </p>
              </div>
              {record.notes ? (
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                    {record.notes}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            {record.prescriptions.length === 0 ? (
              <EmptyState
                title="No prescriptions"
                description="No medication was prescribed during this visit."
                icon={<ClipboardList className="h-6 w-6" />}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="px-5 py-3 font-semibold">Medicine</th>
                      <th className="px-5 py-3 font-semibold">Dosage</th>
                      <th className="px-5 py-3 font-semibold">Frequency</th>
                      <th className="px-5 py-3 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {record.prescriptions.map((prescription, index) => (
                      <tr key={`${prescription.medicine}-${index}`}>
                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {prescription.medicine}
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                          {prescription.dosage}
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                          {prescription.frequency}
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                          {prescription.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

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
                      {patient.mrn} · {patient.gender}
                    </p>
                  </div>
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
                <CardTitle>Attending doctor</CardTitle>
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
                <Link
                  href={`/staff/${doctor.id}`}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
                >
                  Open staff profile
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Vital signs</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {vitals.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
                >
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {record.followUpDate
                  ? formatDate(record.followUpDate)
                  : "No follow-up scheduled"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {record.followUpDate
                  ? "Schedule the follow-up appointment from the appointments module."
                  : "The attending doctor did not request a follow-up."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete medical record?"
        description="This will permanently remove the clinical record and its prescriptions. This action cannot be undone."
        confirmLabel="Delete record"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
