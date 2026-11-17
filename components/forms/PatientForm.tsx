"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { FormSection } from "./FormSection";
import { patientSchema, type PatientFormValues } from "@/lib/schemas";
import { BLOOD_GROUPS, GENDERS, PATIENT_STATUSES } from "@/lib/constants";
import { makeId } from "@/lib/utils";
import type { Patient } from "@/types";

interface PatientFormProps {
  patient?: Patient;
}

export function PatientForm({ patient }: PatientFormProps) {
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [allergyInput, setAllergyInput] = useState("");

  const defaultValues: PatientFormValues = {
    firstName: patient?.firstName ?? "",
    lastName: patient?.lastName ?? "",
    gender: patient?.gender ?? "Female",
    dob: patient?.dob ?? "",
    bloodGroup: patient?.bloodGroup ?? "O+",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
    city: patient?.city ?? "",
    emergencyContactName: patient?.emergencyContactName ?? "",
    emergencyContactPhone: patient?.emergencyContactPhone ?? "",
    insuranceProvider: patient?.insuranceProvider ?? "",
    insuranceNumber: patient?.insuranceNumber ?? "",
    allergies: patient?.allergies ?? [],
    status: patient?.status ?? "Outpatient",
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  const allergies = useWatch({ control, name: "allergies" }) ?? [];

  const addAllergy = () => {
    const value = allergyInput.trim();
    if (!value) return;
    if (allergies.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setAllergyInput("");
      return;
    }
    setValue("allergies", [...allergies, value], { shouldValidate: true });
    setAllergyInput("");
  };

  const removeAllergy = (value: string) => {
    setValue(
      "allergies",
      allergies.filter((item) => item !== value),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (values: PatientFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const id = patient?.id ?? makeId("P", state.patients.map((item) => item.id));
    const mrn =
      patient?.mrn ??
      makeId("MRN-", state.patients.map((item) => item.mrn), 4);
    const payload: Patient = {
      ...values,
      id,
      mrn,
      insuranceProvider: values.insuranceProvider || undefined,
      insuranceNumber: values.insuranceNumber || undefined,
      registeredAt: patient?.registeredAt ?? new Date().toISOString(),
    };
    dispatch({
      type: patient ? "UPDATE_PATIENT" : "ADD_PATIENT",
      payload,
    });
    toast({
      title: patient ? "Patient updated" : "Patient registered",
      description: `${values.firstName} ${values.lastName} has been saved.`,
    });
    router.push(`/patients/${id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection
        title="Personal information"
        description="Core identity and demographic details."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message} required>
            <Input id="firstName" {...register("firstName")} invalid={Boolean(errors.firstName)} />
          </FormField>
          <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message} required>
            <Input id="lastName" {...register("lastName")} invalid={Boolean(errors.lastName)} />
          </FormField>
          <FormField label="Gender" htmlFor="gender" error={errors.gender?.message} required>
            <Select id="gender" {...register("gender")} invalid={Boolean(errors.gender)}>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Date of birth" htmlFor="dob" error={errors.dob?.message} required>
            <Input id="dob" type="date" {...register("dob")} invalid={Boolean(errors.dob)} />
          </FormField>
          <FormField label="Blood group" htmlFor="bloodGroup" error={errors.bloodGroup?.message} required>
            <Select id="bloodGroup" {...register("bloodGroup")} invalid={Boolean(errors.bloodGroup)}>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
            <Select id="status" {...register("status")} invalid={Boolean(errors.status)}>
              {PATIENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Contact details" description="How to reach the patient.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} required>
            <Input id="phone" {...register("phone")} invalid={Boolean(errors.phone)} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" {...register("email")} invalid={Boolean(errors.email)} />
          </FormField>
          <FormField label="City" htmlFor="city" error={errors.city?.message} required>
            <Input id="city" {...register("city")} invalid={Boolean(errors.city)} />
          </FormField>
          <FormField label="Address" htmlFor="address" error={errors.address?.message} required className="sm:col-span-2">
            <Input id="address" {...register("address")} invalid={Boolean(errors.address)} />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Emergency contact"
        description="Person to contact in case of an emergency."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Contact name"
            htmlFor="emergencyContactName"
            error={errors.emergencyContactName?.message}
            required
          >
            <Input
              id="emergencyContactName"
              {...register("emergencyContactName")}
              invalid={Boolean(errors.emergencyContactName)}
            />
          </FormField>
          <FormField
            label="Contact phone"
            htmlFor="emergencyContactPhone"
            error={errors.emergencyContactPhone?.message}
            required
          >
            <Input
              id="emergencyContactPhone"
              {...register("emergencyContactPhone")}
              invalid={Boolean(errors.emergencyContactPhone)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Insurance"
        description="Optional cover details for billing."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Provider" htmlFor="insuranceProvider" error={errors.insuranceProvider?.message}>
            <Input id="insuranceProvider" {...register("insuranceProvider")} />
          </FormField>
          <FormField label="Policy number" htmlFor="insuranceNumber" error={errors.insuranceNumber?.message}>
            <Input id="insuranceNumber" {...register("insuranceNumber")} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Medical information" description="Known allergies and clinical notes.">
        <FormField
          label="Allergies"
          htmlFor="allergy-input"
          hint="Type an allergy and press Enter to add it."
          error={errors.allergies?.message}
        >
          <div className="flex gap-2">
            <Input
              id="allergy-input"
              value={allergyInput}
              onChange={(event) => setAllergyInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addAllergy();
                }
              }}
              placeholder="e.g. Penicillin"
            />
            <Button type="button" variant="secondary" onClick={addAllergy} icon={<Plus className="h-4 w-4" />}>
              Add
            </Button>
          </div>
        </FormField>
        <div className="mt-3 flex flex-wrap gap-2">
          {allergies.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No allergies recorded.
            </p>
          ) : (
            allergies.map((allergy) => (
              <Badge key={allergy} tone="red">
                {allergy}
                <button
                  type="button"
                  onClick={() => removeAllergy(allergy)}
                  aria-label={`Remove ${allergy}`}
                  className="ml-1 rounded-full p-0.5 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </FormSection>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => router.push(patient ? `/patients/${patient.id}` : "/patients")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {patient ? "Save changes" : "Register patient"}
        </Button>
      </div>
    </form>
  );
}
