"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Stethoscope,
  Trash2,
  Users,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DepartmentForm } from "@/components/forms/DepartmentForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { fullName } from "@/lib/format";
import type { Department } from "@/types";

export default function DepartmentsPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Department | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (department: Department) => {
    setEditing(department);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: "DELETE_DEPARTMENT", payload: pendingDelete.id });
    toast({
      title: "Department removed",
      description: `${pendingDelete.name} was removed and its staff reassigned.`,
    });
    setPendingDelete(null);
  };

  const doctorCount = state.staff.filter(
    (member) => member.role === "Doctor"
  ).length;

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Hospital departments, clinical leadership, and contact information."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Add department
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Departments
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {state.departments.length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total staff
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {state.staff.length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Doctors
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {doctorCount}
            </p>
          </div>
        </Card>
      </div>

      {state.departments.length === 0 ? (
        <Card>
          <EmptyState
            title="No departments"
            description="Create the first department to organize staff, appointments, and wards."
            icon={<Building2 className="h-6 w-6" />}
            action={
              <Button size="sm" onClick={openCreate}>
                Add department
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.departments.map((department) => {
            const members = state.staff.filter(
              (member) => member.departmentId === department.id
            );
            const doctors = members.filter(
              (member) => member.role === "Doctor"
            );
            const head = state.staff.find(
              (member) => member.id === department.headStaffId
            );
            return (
              <Card key={department.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {department.name}
                      </h2>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {department.location}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${department.name}`}
                        onClick={() => openEdit(department)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${department.name}`}
                        onClick={() => setPendingDelete(department)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {department.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="blue">{members.length} staff</Badge>
                    <Badge tone="teal">{doctors.length} doctors</Badge>
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    {head ? (
                      <>
                        <Avatar name={fullName(head)} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Head of department
                          </p>
                          <Link
                            href={`/staff/${head.id}`}
                            className="block truncate text-sm font-medium text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                          >
                            Dr. {fullName(head)}
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No head assigned
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <p className="inline-flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      {department.phone}
                    </p>
                    <p className="inline-flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      {department.name.toLowerCase().replace(/\s+/g, ".")}
                      @medicore.health
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit department" : "Add department"}
        description={
          editing
            ? "Update department details and leadership."
            : "Create a new department for staff and patients."
        }
      >
        <DepartmentForm
          department={editing ?? undefined}
          onDone={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete department?"
        description={
          pendingDelete
            ? `Deleting ${pendingDelete.name} will reassign its staff and appointments to another department. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete department"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
