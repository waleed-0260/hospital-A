"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PATIENT_STATUSES, PAGE_SIZE, statusTone } from "@/lib/constants";
import { calcAge, formatDate, fullName } from "@/lib/format";
import { matchesQuery, paginate } from "@/lib/utils";
import type { Patient } from "@/types";

export default function PatientsPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Patient | null>(null);

  const statusTabs = useMemo(
    () => [
      { value: "All", label: "All", count: state.patients.length },
      ...PATIENT_STATUSES.map((item) => ({
        value: item,
        label: item,
        count: state.patients.filter((patient) => patient.status === item)
          .length,
      })),
    ],
    [state.patients]
  );

  const filtered = useMemo(() => {
    return state.patients.filter((patient) => {
      if (status !== "All" && patient.status !== status) return false;
      return matchesQuery(query, [
        fullName(patient),
        patient.mrn,
        patient.phone,
        patient.email,
        patient.city,
        patient.bloodGroup,
      ]);
    });
  }, [state.patients, query, status]);

  const rows = paginate(filtered, page, PAGE_SIZE);

  const columns: TableColumn<Patient>[] = [
    {
      key: "patient",
      header: "Patient",
      sortable: true,
      sortValue: (patient) => `${patient.firstName} ${patient.lastName}`,
      render: (patient) => (
        <Link
          href={`/patients/${patient.id}`}
          className="flex items-center gap-3 group"
        >
          <Avatar name={fullName(patient)} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">
              {fullName(patient)}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {patient.mrn}
            </span>
          </span>
        </Link>
      ),
    },
    {
      key: "age",
      header: "Age / Gender",
      sortable: true,
      sortValue: (patient) => calcAge(patient.dob),
      render: (patient) => (
        <span className="text-sm">
          {calcAge(patient.dob)} yrs · {patient.gender}
        </span>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (patient) => (
        <span className="block max-w-[180px]">
          <span className="block truncate text-sm">{patient.phone}</span>
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
            {patient.email}
          </span>
        </span>
      ),
    },
    {
      key: "blood",
      header: "Blood",
      render: (patient) => (
        <Badge tone="red">{patient.bloodGroup}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (patient) => patient.status,
      render: (patient) => (
        <Badge tone={statusTone(patient.status)} dot>
          {patient.status}
        </Badge>
      ),
    },
    {
      key: "registered",
      header: "Registered",
      sortable: true,
      sortValue: (patient) => patient.registeredAt,
      render: (patient) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(patient.registeredAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (patient) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/patients/${patient.id}`}>
            <Button variant="ghost" size="icon" aria-label={`View ${fullName(patient)}`}>
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/patients/${patient.id}/edit`}>
            <Button variant="ghost" size="icon" aria-label={`Edit ${fullName(patient)}`}>
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${fullName(patient)}`}
            onClick={() => setPendingDelete(patient)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: "DELETE_PATIENT", payload: pendingDelete.id });
    toast({
      title: "Patient deleted",
      description: `${fullName(pendingDelete)} and related records were removed.`,
    });
    setPendingDelete(null);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Search, register, and manage patient records across the hospital."
        actions={
          <Link href="/patients/new">
            <Button icon={<UserPlus className="h-4 w-4" />}>
              Register patient
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="Search by name, MRN, phone, email…"
              className="sm:max-w-sm"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </span>
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
                {PATIENT_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
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
          getRowKey={(patient) => patient.id}
          initialSortKey="patient"
          emptyTitle="No patients found"
          emptyDescription="Try a different search or register a new patient."
          emptyAction={
            <Link href="/patients/new">
              <Button size="sm" icon={<Users className="h-4 w-4" />}>
                Register patient
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
        title="Delete patient?"
        description={
          pendingDelete
            ? `This will permanently remove ${fullName(pendingDelete)} and all related appointments, records, lab tests, and invoices. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete patient"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
