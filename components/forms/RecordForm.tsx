"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "./FormSection";
import { recordSchema, type RecordFormValues } from "@/lib/schemas";
import { makeId } from "@/lib/utils";
import { fullName } from "@/lib/format";
import type { MedicalRecord } from "@/types";

interface RecordFormProps {
  record?: MedicalRecord;
}

const vitalFields: Array<{
  key: keyof RecordFormValues["vitals"];
  label: string;
  placeholder: string;
}> = [
  { key: "bp", label: "Blood pressure", placeholder: "120/80 mmHg" },
  { key: "heartRate", label: "Heart rate", placeholder: "72 bpm" },
  { key: "temperature", label: "Temperature", placeholder: "36.8 °C" },
  { key: "weight", label: "Weight", placeholder: "70 kg" },
  { key: "height", label: "Height", placeholder: "175 cm" },
  { key: "spo2", label: "SpO₂", placeholder: "98%" },
];

export function RecordForm({ record }: RecordFormProps) {
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const doctors = state.staff.filter((member) => member.role === "Doctor");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      patientId: record?.patientId ?? state.patients[0]?.id ?? "",
      doctorId: record?.doctorId ?? doctors[0]?.id ?? "",
      date: record?.date ?? new Date().toISOString().slice(0, 10),
      diagnosis: record?.diagnosis ?? "",
      symptoms: record?.symptoms ?? "",
      treatment: record?.treatment ?? "",
      prescriptions:
        record?.prescriptions && record.prescriptions.length > 0
          ? record.prescriptions
          : [{ medicine: "", dosage: "", frequency: "", duration: "" }],
      vitals: {
        bp: record?.vitals.bp ?? "",
        heartRate: record?.vitals.heartRate ?? "",
        temperature: record?.vitals.temperature ?? "",
        weight: record?.vitals.weight ?? "",
        height: record?.vitals.height ?? "",
        spo2: record?.vitals.spo2 ?? "",
      },
      followUpDate: record?.followUpDate ?? "",
      notes: record?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  });

  const prescriptions =
    useWatch({ control, name: "prescriptions" }) ?? [];

  const onSubmit = async (values: RecordFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const payload: MedicalRecord = {
      ...values,
      followUpDate: values.followUpDate || undefined,
      notes: values.notes || undefined,
      id:
        record?.id ??
        makeId("R", state.records.map((item) => item.id)),
    };
    dispatch({ type: record ? "UPDATE_RECORD" : "ADD_RECORD", payload });
    toast({
      title: record ? "Medical record updated" : "Medical record created",
      description: "The clinical record has been saved.",
    });
    router.push(`/records/${payload.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="Visit details" description="Patient, doctor, and visit date.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Patient" htmlFor="patientId" error={errors.patientId?.message} required>
            <Select id="patientId" {...register("patientId")} invalid={Boolean(errors.patientId)}>
              {state.patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {fullName(patient)} · {patient.mrn}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Doctor" htmlFor="doctorId" error={errors.doctorId?.message} required>
            <Select id="doctorId" {...register("doctorId")} invalid={Boolean(errors.doctorId)}>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {fullName(doctor)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Date" htmlFor="date" error={errors.date?.message} required>
            <Input id="date" type="date" {...register("date")} invalid={Boolean(errors.date)} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Vital signs" description="Record the latest measurements.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vitalFields.map((vital) => (
            <FormField
              key={vital.key}
              label={vital.label}
              htmlFor={`vitals-${vital.key}`}
              error={errors.vitals?.[vital.key]?.message}
              required
            >
              <Input
                id={`vitals-${vital.key}`}
                placeholder={vital.placeholder}
                {...register(`vitals.${vital.key}`)}
                invalid={Boolean(errors.vitals?.[vital.key])}
              />
            </FormField>
          ))}
        </div>
      </FormSection>

      <FormSection title="Clinical assessment" description="Symptoms, diagnosis, and treatment plan.">
        <div className="space-y-4">
          <FormField label="Symptoms" htmlFor="symptoms" error={errors.symptoms?.message} required>
            <Textarea id="symptoms" {...register("symptoms")} invalid={Boolean(errors.symptoms)} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Diagnosis" htmlFor="diagnosis" error={errors.diagnosis?.message} required>
              <Input id="diagnosis" {...register("diagnosis")} invalid={Boolean(errors.diagnosis)} />
            </FormField>
            <FormField label="Follow-up date" htmlFor="followUpDate" error={errors.followUpDate?.message}>
              <Input id="followUpDate" type="date" {...register("followUpDate")} />
            </FormField>
          </div>
          <FormField label="Treatment" htmlFor="treatment" error={errors.treatment?.message} required>
            <Textarea id="treatment" {...register("treatment")} invalid={Boolean(errors.treatment)} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Prescriptions" description="Add one row per prescribed medicine.">
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] sm:items-start"
            >
              <FormField
                label="Medicine"
                htmlFor={`prescription-${index}-medicine`}
                error={errors.prescriptions?.[index]?.medicine?.message}
                required
              >
                <Input
                  id={`prescription-${index}-medicine`}
                  placeholder="Medicine"
                  {...register(`prescriptions.${index}.medicine`)}
                  invalid={Boolean(errors.prescriptions?.[index]?.medicine)}
                />
              </FormField>
              <FormField
                label="Dosage"
                htmlFor={`prescription-${index}-dosage`}
                error={errors.prescriptions?.[index]?.dosage?.message}
                required
              >
                <Input
                  id={`prescription-${index}-dosage`}
                  placeholder="1 tablet"
                  {...register(`prescriptions.${index}.dosage`)}
                  invalid={Boolean(errors.prescriptions?.[index]?.dosage)}
                />
              </FormField>
              <FormField
                label="Frequency"
                htmlFor={`prescription-${index}-frequency`}
                error={errors.prescriptions?.[index]?.frequency?.message}
                required
              >
                <Input
                  id={`prescription-${index}-frequency`}
                  placeholder="Twice daily"
                  {...register(`prescriptions.${index}.frequency`)}
                  invalid={Boolean(errors.prescriptions?.[index]?.frequency)}
                />
              </FormField>
              <FormField
                label="Duration"
                htmlFor={`prescription-${index}-duration`}
                error={errors.prescriptions?.[index]?.duration?.message}
                required
              >
                <Input
                  id={`prescription-${index}-duration`}
                  placeholder="7 days"
                  {...register(`prescriptions.${index}.duration`)}
                  invalid={Boolean(errors.prescriptions?.[index]?.duration)}
                />
              </FormField>
              <div className="flex items-end sm:pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove prescription ${index + 1}`}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {errors.prescriptions?.root?.message ? (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {errors.prescriptions.root.message}
            </p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() =>
              append({ medicine: "", dosage: "", frequency: "", duration: "" })
            }
          >
            Add prescription
          </Button>
          {prescriptions?.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No prescriptions added yet.
            </p>
          ) : null}
        </div>
      </FormSection>

      <FormSection title="Notes" description="Optional additional notes.">
        <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
          <Textarea id="notes" {...register("notes")} />
        </FormField>
      </FormSection>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {record ? "Save changes" : "Create record"}
        </Button>
      </div>
    </form>
  );
}
