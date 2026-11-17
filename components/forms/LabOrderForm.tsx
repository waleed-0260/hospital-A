"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { labOrderSchema, type LabOrderFormValues } from "@/lib/schemas";
import { LAB_PRIORITIES, LAB_TEST_CATALOG } from "@/lib/constants";
import { makeId } from "@/lib/utils";
import { fullName } from "@/lib/format";
import type { LabTest } from "@/types";

interface LabOrderFormProps {
  onDone: () => void;
  onCancel: () => void;
}

export function LabOrderForm({ onDone, onCancel }: LabOrderFormProps) {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const doctors = state.staff.filter((member) => member.role === "Doctor");
  const firstTest = LAB_TEST_CATALOG[0];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LabOrderFormValues>({
    resolver: zodResolver(labOrderSchema),
    defaultValues: {
      patientId: state.patients[0]?.id ?? "",
      doctorId: doctors[0]?.id ?? "",
      testName: firstTest.name,
      category: firstTest.category,
      priority: "Routine",
      price: String(firstTest.price),
    },
  });

  const testField = register("testName");

  const onSubmit = async (values: LabOrderFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    const payload: LabTest = {
      id: makeId("L", state.labTests.map((item) => item.id)),
      patientId: values.patientId,
      doctorId: values.doctorId,
      testName: values.testName,
      category: values.category,
      orderedAt: new Date().toISOString(),
      status: "Pending",
      priority: values.priority,
      price: Number(values.price),
    };
    dispatch({ type: "ADD_LAB_TEST", payload });
    toast({
      title: "Lab test ordered",
      description: `${values.testName} is now pending.`,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Patient" htmlFor="patientId" error={errors.patientId?.message} required>
        <Select id="patientId" {...register("patientId")} invalid={Boolean(errors.patientId)}>
          {state.patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {fullName(patient)} · {patient.mrn}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Ordering doctor" htmlFor="doctorId" error={errors.doctorId?.message} required>
        <Select id="doctorId" {...register("doctorId")} invalid={Boolean(errors.doctorId)}>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              Dr. {fullName(doctor)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Test" htmlFor="testName" error={errors.testName?.message} required>
        <Select
          id="testName"
          {...testField}
          onChange={(event) => {
            void testField.onChange(event);
            const selected = LAB_TEST_CATALOG.find(
              (item) => item.name === event.target.value
            );
            if (selected) {
              setValue("category", selected.category, { shouldValidate: true });
              setValue("price", String(selected.price), { shouldValidate: true });
            }
          }}
        >
          {LAB_TEST_CATALOG.map((test) => (
            <option key={test.name} value={test.name}>
              {test.name} · ${test.price}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Category" htmlFor="category" error={errors.category?.message} required>
          <Input id="category" readOnly {...register("category")} />
        </FormField>
        <FormField label="Price ($)" htmlFor="price" error={errors.price?.message} required>
          <Input id="price" type="number" step="0.01" readOnly {...register("price")} />
        </FormField>
      </div>
      <FormField label="Priority" htmlFor="priority" error={errors.priority?.message} required>
        <Select id="priority" {...register("priority")}>
          {LAB_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Order test
        </Button>
      </div>
    </form>
  );
}
