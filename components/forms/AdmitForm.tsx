"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { admitSchema, type AdmitFormValues } from "@/lib/schemas";
import { fullName } from "@/lib/format";
import type { Bed } from "@/types";

interface AdmitFormProps {
  bed: Bed;
  onDone: () => void;
  onCancel: () => void;
}

export function AdmitForm({ bed, onDone, onCancel }: AdmitFormProps) {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdmitFormValues>({
    resolver: zodResolver(admitSchema),
    defaultValues: {
      patientId: state.patients[0]?.id ?? "",
      admittedAt: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (values: AdmitFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    dispatch({
      type: "ADMIT_PATIENT",
      payload: {
        patientId: values.patientId,
        bedId: bed.id,
        admittedAt: new Date(values.admittedAt).toISOString(),
      },
    });
    toast({
      title: "Patient admitted",
      description: `Bed ${bed.bedNumber} is now occupied.`,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Assign a patient to bed{" "}
        <span className="font-semibold text-slate-900 dark:text-white">
          {bed.bedNumber}
        </span>
        .
      </p>
      <FormField label="Patient" htmlFor="patientId" error={errors.patientId?.message} required>
        <Select id="patientId" {...register("patientId")} invalid={Boolean(errors.patientId)}>
          {state.patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {fullName(patient)} · {patient.mrn} · {patient.status}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Admission date" htmlFor="admittedAt" error={errors.admittedAt?.message} required>
        <Input id="admittedAt" type="date" {...register("admittedAt")} invalid={Boolean(errors.admittedAt)} />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Admit patient
        </Button>
      </div>
    </form>
  );
}
