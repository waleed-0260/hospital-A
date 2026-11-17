"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  PAGE_SIZE,
  STAFF_ROLES,
  STAFF_STATUSES,
  statusTone,
} from "@/lib/constants";
import { fullName } from "@/lib/format";
import { matchesQuery, paginate } from "@/lib/utils";
import type { Staff } from "@/types";

export default function StaffPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Staff | null>(null);

  const departmentName = (id: string) =>
    state.departments.find((department) => department.id === id)?.name ??
    "Unassigned";

  const filtered = useMemo(() => {
    return state.staff.filter((member) => {
      if (role !== "All" && member.role !== role) return false;
      if (status !== "All" && member.status !== status) return false;
      return matchesQuery(query, [
        fullName(member),
        member.employeeId,
        member.phone,
        member.email,
        member.specialization,
        departmentName(member.departmentId),
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.staff, state.departments, query, role, status]);

  const rows = paginate(filtered, page, PAGE_SIZE);

  const columns: TableColumn<Staff>[] = [
    {
      key: "name",
      header: "Staff member",
      sortable: true,
      sortValue: (member) => `${member.firstName} ${member.lastName}`,
      render: (member) => (
        <Link href={`/staff/${member.id}`} className="group flex items-center gap-3">
          <Avatar name={fullName(member)} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">
              {member.role === "Doctor" ? "Dr. " : ""}
              {fullName(member)}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {member.employeeId}
            </span>
          </span>
        </Link>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      sortValue: (member) => member.role,
      render: (member) => (
        <Badge tone={statusTone(member.role)}>{member.role}</Badge>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (member) => (
        <span className="text-sm">{departmentName(member.departmentId)}</span>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (member) => (
        <span className="block max-w-[180px]">
          <span className="block truncate text-sm">{member.phone}</span>
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
            {member.email}
          </span>
        </span>
      ),
    },
    {
      key: "shift",
      header: "Shift",
      render: (member) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {member.shift}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (member) => member.status,
      render: (member) => (
        <Badge tone={statusTone(member.status)} dot>
          {member.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (member) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/staff/${member.id}`}>
            <Button variant="ghost" size="icon" aria-label="View staff member">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/staff/${member.id}/edit`}>
            <Button variant="ghost" size="icon" aria-label="Edit staff member">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete staff member"
            onClick={() => setPendingDelete(member)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: "DELETE_STAFF", payload: pendingDelete.id });
    toast({
      title: "Staff member removed",
      description: `${fullName(pendingDelete)} and their assignments were removed.`,
    });
    setPendingDelete(null);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Doctors, nurses, technicians, pharmacists, and support teams."
        actions={
          <Link href="/staff/new">
            <Button icon={<UserPlus className="h-4 w-4" />}>Add staff</Button>
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
            placeholder="Search name, ID, phone, specialization…"
            className="sm:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by role"
              className="w-36"
            >
              <option value="All">All roles</option>
              {STAFF_ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
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
              {STAFF_STATUSES.map((item) => (
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

        <Table
          columns={columns}
          data={rows}
          getRowKey={(member) => member.id}
          emptyTitle="No staff found"
          emptyDescription="Try different filters or add a new staff member."
          emptyAction={
            <Link href="/staff/new">
              <Button size="sm" icon={<Users className="h-4 w-4" />}>
                Add staff
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
        title="Remove staff member?"
        description={
          pendingDelete
            ? `This will remove ${fullName(pendingDelete)} and unassign their appointments, records, and lab tests. This action cannot be undone.`
            : ""
        }
        confirmLabel="Remove staff"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
