"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarPlus,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RescheduleForm } from "@/components/forms/RescheduleForm";
import {
  APPOINTMENT_STATUSES,
  PAGE_SIZE,
  statusTone,
} from "@/lib/constants";
import { formatDate, fullName } from "@/lib/format";
import { matchesQuery, paginate } from "@/lib/utils";
import type { Appointment } from "@/types";

export default function AppointmentsPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null);

  const patientName = (id: string) => {
    const patient = state.patients.find((item) => item.id === id);
    return patient ? fullName(patient) : "Unknown patient";
  };
  const doctorName = (id: string) => {
    const doctor = state.staff.find((item) => item.id === id);
    return doctor ? `Dr. ${fullName(doctor)}` : "Unassigned";
  };
  const departmentName = (id: string) =>
    state.departments.find((department) => department.id === id)?.name ??
    "General";

  const statusTabs = useMemo(
    () => [
      { value: "All", label: "All", count: state.appointments.length },
      ...APPOINTMENT_STATUSES.map((item) => ({
        value: item,
        label: item,
        count: state.appointments.filter(
          (appointment) => appointment.status === item
        ).length,
      })),
    ],
    [state.appointments]
  );

  const filtered = useMemo(() => {
    return state.appointments.filter((appointment) => {
      if (status !== "All" && appointment.status !== status) return false;
      if (date && appointment.date !== date) return false;
      return matchesQuery(query, [
        patientName(appointment.patientId),
        doctorName(appointment.doctorId),
        departmentName(appointment.departmentId),
        appointment.reason,
        appointment.type,
        appointment.date,
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, query, status, date]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (left, right) =>
          new Date(`${right.date}T${right.time}`).getTime() -
          new Date(`${left.date}T${left.time}`).getTime()
      ),
    [filtered]
  );

  const rows = paginate(sorted, page, PAGE_SIZE);

  const columns: TableColumn<Appointment>[] = [
    {
      key: "datetime",
      header: "Date & time",
      render: (appointment) => (
        <span className="block">
          <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            {formatDate(appointment.date)}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {appointment.time}
          </span>
        </span>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (appointment) => (
        <Link
          href={`/patients/${appointment.patientId}`}
          className="text-sm font-medium text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
        >
          {patientName(appointment.patientId)}
        </Link>
      ),
    },
    {
      key: "doctor",
      header: "Doctor / Department",
      render: (appointment) => (
        <span className="block">
          <span className="block text-sm text-slate-800 dark:text-slate-200">
            {doctorName(appointment.doctorId)}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {departmentName(appointment.departmentId)}
          </span>
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (appointment) => (
        <Badge tone={statusTone(appointment.type)}>{appointment.type}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (appointment) => (
        <Badge tone={statusTone(appointment.status)} dot>
          {appointment.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (appointment) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/appointments/${appointment.id}`}>
            <Button variant="ghost" size="icon" aria-label="View appointment">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/appointments/${appointment.id}/edit`}>
            <Button variant="ghost" size="icon" aria-label="Edit appointment">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reschedule appointment"
            onClick={() => setRescheduling(appointment)}
          >
            <CalendarClock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete appointment"
            onClick={() => setPendingDelete(appointment)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: "DELETE_APPOINTMENT", payload: pendingDelete.id });
    toast({
      title: "Appointment deleted",
      description: `${patientName(pendingDelete.patientId)}'s appointment was removed.`,
    });
    setPendingDelete(null);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Schedule and track consultations, follow-ups, procedures, and emergencies."
        actions={
          <Link href="/appointments/new">
            <Button icon={<CalendarPlus className="h-4 w-4" />}>
              New appointment
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="Search patient, doctor, reason…"
              className="lg:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by date"
                  className="w-40"
                />
                {date ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDate("");
                      setPage(1);
                    }}
                    aria-label="Clear date filter"
                    className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-slate-400 shadow dark:bg-slate-900"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                aria-label="Filter by status"
                className="w-36"
              >
                <option value="All">All statuses</option>
                {APPOINTMENT_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <Tabs
            tabs={statusTabs}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </div>

        <Table
          columns={columns}
          data={rows}
          getRowKey={(appointment) => appointment.id}
          emptyTitle="No appointments found"
          emptyDescription="Try adjusting filters or schedule a new appointment."
          emptyAction={
            <Link href="/appointments/new">
              <Button size="sm" icon={<CalendarPlus className="h-4 w-4" />}>
                New appointment
              </Button>
            </Link>
          }
        />

        {filtered.length > 0 ? (
          <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </Card>

      <Modal
        open={Boolean(rescheduling)}
        onClose={() => setRescheduling(null)}
        title="Reschedule appointment"
        description={
          rescheduling
            ? `${patientName(rescheduling.patientId)} · ${doctorName(rescheduling.doctorId)}`
            : undefined
        }
      >
        {rescheduling ? (
          <RescheduleForm
            appointment={rescheduling}
            onDone={() => setRescheduling(null)}
            onCancel={() => setRescheduling(null)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete appointment?"
        description={
          pendingDelete
            ? `This will permanently remove the ${pendingDelete.type.toLowerCase()} appointment for ${patientName(pendingDelete.patientId)} on ${formatDate(pendingDelete.date)} at ${pendingDelete.time}.`
            : ""
        }
        confirmLabel="Delete appointment"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
