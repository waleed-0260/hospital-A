"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { departmentSchema, type DepartmentFormValues } from "@/lib/schemas";
import { makeId } from "@/lib/utils";
import type { Department } from "@/types";

interface DepartmentFormProps {
  department?: Department;
  onDone: () => void;
  onCancel: () => void;
}

export function DepartmentForm({
  department,
  onDone,
  onCancel,
}: DepartmentFormProps) {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const doctors = state.staff.filter((member) => member.role === "Doctor");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name ?? "",
      headStaffId: department?.headStaffId ?? "",
      description: department?.description ?? "",
      location: department?.location ?? "",
      phone: department?.phone ?? "",
    },
  });

  const onSubmit = async (values: DepartmentFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    const payload: Department = {
      ...values,
      id:
        department?.id ??
        makeId("D", state.departments.map((item) => item.id), 2),
    };
    dispatch({
      type: department ? "UPDATE_DEPARTMENT" : "ADD_DEPARTMENT",
      payload,
    });
    toast({
      title: department ? "Department updated" : "Department added",
      description: `${values.name} has been saved.`,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Department name" htmlFor="name" error={errors.name?.message} required>
        <Input id="name" {...register("name")} invalid={Boolean(errors.name)} />
      </FormField>
      <FormField label="Head of department" htmlFor="headStaffId" error={errors.headStaffId?.message}>
        <Select id="headStaffId" {...register("headStaffId")}>
          <option value="">No head assigned</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              Dr. {doctor.firstName} {doctor.lastName}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Location" htmlFor="location" error={errors.location?.message} required>
        <Input id="location" {...register("location")} invalid={Boolean(errors.location)} />
      </FormField>
      <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} required>
        <Input id="phone" {...register("phone")} invalid={Boolean(errors.phone)} />
      </FormField>
      <FormField label="Description" htmlFor="description" error={errors.description?.message} required>
        <Textarea id="description" {...register("description")} invalid={Boolean(errors.description)} />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {department ? "Save changes" : "Add department"}
        </Button>
      </div>
    </form>
  );
}
