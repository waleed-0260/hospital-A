"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "./FormSection";
import { staffSchema, type StaffFormValues } from "@/lib/schemas";
import {
  SHIFTS,
  SPECIALIZATIONS,
  STAFF_ROLES,
  STAFF_STATUSES,
} from "@/lib/constants";
import { makeId } from "@/lib/utils";
import type { Staff } from "@/types";

interface StaffFormProps {
  member?: Staff;
  onDone?: () => void;
}

export function StaffForm({ member, onDone }: StaffFormProps) {
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();

  const defaultValues: StaffFormValues = {
    firstName: member?.firstName ?? "",
    lastName: member?.lastName ?? "",
    role: member?.role ?? "Doctor",
    departmentId: member?.departmentId ?? state.departments[0]?.id ?? "",
    specialization: member?.specialization ?? "",
    phone: member?.phone ?? "",
    email: member?.email ?? "",
    joinDate: member?.joinDate ?? new Date().toISOString().slice(0, 10),
    shift: member?.shift ?? "Morning",
    status: member?.status ?? "Active",
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues,
  });

  const role = useWatch({ control, name: "role" });

  const onSubmit = async (values: StaffFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const id =
      member?.id ?? makeId("S", state.staff.map((item) => item.id));
    const employeeId =
      member?.employeeId ??
      makeId("EMP-", state.staff.map((item) => item.employeeId), 4);
    const payload: Staff = {
      ...values,
      id,
      employeeId,
      specialization: values.role === "Doctor" ? values.specialization : undefined,
    };
    dispatch({ type: member ? "UPDATE_STAFF" : "ADD_STAFF", payload });
    toast({
      title: member ? "Staff updated" : "Staff member added",
      description: `${values.firstName} ${values.lastName} has been saved.`,
    });
    if (onDone) onDone();
    else router.push(`/staff/${id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="Staff profile" description="Identity and employment details.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message} required>
            <Input id="firstName" {...register("firstName")} invalid={Boolean(errors.firstName)} />
          </FormField>
          <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message} required>
            <Input id="lastName" {...register("lastName")} invalid={Boolean(errors.lastName)} />
          </FormField>
          <FormField label="Role" htmlFor="role" error={errors.role?.message} required>
            <Select id="role" {...register("role")}>
              {STAFF_ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Department" htmlFor="departmentId" error={errors.departmentId?.message} required>
            <Select id="departmentId" {...register("departmentId")} invalid={Boolean(errors.departmentId)}>
              <option value="">Select department</option>
              {state.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </FormField>
          {role === "Doctor" ? (
            <FormField
              label="Specialization"
              htmlFor="specialization"
              error={errors.specialization?.message}
            >
              <Input
                id="specialization"
                list="specializations"
                {...register("specialization")}
              />
              <datalist id="specializations">
                {SPECIALIZATIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </FormField>
          ) : null}
          <FormField label="Shift" htmlFor="shift" error={errors.shift?.message} required>
            <Select id="shift" {...register("shift")}>
              {SHIFTS.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Join date" htmlFor="joinDate" error={errors.joinDate?.message} required>
            <Input id="joinDate" type="date" {...register("joinDate")} invalid={Boolean(errors.joinDate)} />
          </FormField>
          <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
            <Select id="status" {...register("status")}>
              {STAFF_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Contact" description="Work contact information.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} required>
            <Input id="phone" {...register("phone")} invalid={Boolean(errors.phone)} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" {...register("email")} invalid={Boolean(errors.email)} />
          </FormField>
        </div>
      </FormSection>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            if (onDone) onDone();
            else router.push(member ? `/staff/${member.id}` : "/staff");
          }}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {member ? "Save changes" : "Add staff member"}
        </Button>
      </div>
    </form>
  );
}
