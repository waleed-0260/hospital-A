"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, FilePlus2, FileText, Pencil, Trash2, X } from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Input } from "@/components/ui/Input";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate, fullName } from "@/lib/format";
import { matchesQuery, paginate } from "@/lib/utils";
import type { MedicalRecord } from "@/types";

export default function RecordsPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<MedicalRecord | null>(null);

  const patientName = (id: string) => {
    const patient = state.patients.find((item) => item.id === id);
    return patient ? fullName(patient) : "Unknown patient";
  };
  const doctorName = (id: string) => {
    const doctor = state.staff.find((item) => item.id === id);
    return doctor ? `Dr. ${fullName(doctor)}` : "Unassigned";
  };

  const filtered = useMemo(() => {
    const items = state.records.filter((record) => {
      if (date && record.date !== date) return false;
      return matchesQuery(query, [
        patientName(record.patientId),
        doctorName(record.doctorId),
        record.diagnosis,
        record.symptoms,
        record.treatment,
      ]);
    });
    return [...items].sort(
      (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, query, date]);

  const rows = paginate(filtered, page, PAGE_SIZE);

  const columns: TableColumn<MedicalRecord>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (record) => record.date,
      render: (record) => (
        <span className="whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
          {formatDate(record.date)}
        </span>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (record) => (
        <Link
          href={`/patients/${record.patientId}`}
          className="text-sm font-medium text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
        >
          {patientName(record.patientId)}
        </Link>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (record) => (
        <span className="text-sm">{doctorName(record.doctorId)}</span>
      ),
    },
    {
      key: "diagnosis",
      header: "Diagnosis",
      render: (record) => (
        <span className="block max-w-[220px]">
          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {record.diagnosis}
          </span>
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
            {record.symptoms}
          </span>
        </span>
      ),
    },
    {
      key: "prescriptions",
      header: "Rx",
      render: (record) => (
        <Badge tone="blue">{record.prescriptions.length} items</Badge>
      ),
    },
    {
      key: "followup",
      header: "Follow-up",
      render: (record) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {record.followUpDate ? formatDate(record.followUpDate) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (record) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/records/${record.id}`}>
            <Button variant="ghost" size="icon" aria-label="View record">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/records/${record.id}/edit`}>
            <Button variant="ghost" size="icon" aria-label="Edit record">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete record"
            onClick={() => setPendingDelete(record)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: "DELETE_RECORD", payload: pendingDelete.id });
    toast({
      title: "Medical record deleted",
      description: "The clinical record has been removed.",
    });
    setPendingDelete(null);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Medical Records"
        description="Clinical notes, diagnoses, prescriptions, and vitals for every patient."
        actions={
          <Link href="/records/new">
            <Button icon={<FilePlus2 className="h-4 w-4" />}>New record</Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search patient, doctor, diagnosis…"
            className="sm:max-w-sm"
          />
          <div className="flex items-center gap-2">
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
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {filtered.length} record{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <Table
          columns={columns}
          data={rows}
          getRowKey={(record) => record.id}
          emptyTitle="No medical records"
          emptyDescription="Create a record after a patient consultation."
          emptyAction={
            <Link href="/records/new">
              <Button size="sm" icon={<FileText className="h-4 w-4" />}>
                New record
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete medical record?"
        description="This will permanently remove the clinical record and its prescriptions. This action cannot be undone."
        confirmLabel="Delete record"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
