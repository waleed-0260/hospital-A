"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "./FormSection";
import { appointmentSchema, type AppointmentFormValues } from "@/lib/schemas";
import {
  APPOINTMENT_SLOTS,
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
} from "@/lib/constants";
import { makeId } from "@/lib/utils";
import { fullName } from "@/lib/format";
import type { Appointment } from "@/types";

interface AppointmentFormProps {
  appointment?: Appointment;
  onDone?: (appointment: Appointment) => void;
}

export function AppointmentForm({
  appointment,
  onDone,
}: AppointmentFormProps) {
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const doctors = state.staff.filter((member) => member.role === "Doctor");

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? state.patients[0]?.id ?? "",
      departmentId:
        appointment?.departmentId ?? state.departments[0]?.id ?? "",
      doctorId: appointment?.doctorId ?? "",
      date: appointment?.date ?? new Date().toISOString().slice(0, 10),
      time: appointment?.time ?? "",
      type: appointment?.type ?? "Consultation",
      status: appointment?.status ?? "Scheduled",
      reason: appointment?.reason ?? "",
      notes: appointment?.notes ?? "",
    },
  });

  const departmentId = useWatch({ control, name: "departmentId" });
  const doctorId = useWatch({ control, name: "doctorId" });
  const date = useWatch({ control, name: "date" });

  useEffect(() => {
    const current = getValues("doctorId");
    if (!current) return;
    const doctor = state.staff.find((member) => member.id === current);
    if (doctor && doctor.departmentId !== departmentId) {
      setValue("doctorId", "");
      setValue("time", "");
    }
  }, [departmentId, getValues, setValue, state.staff]);

  const departmentDoctors = doctors.filter(
    (doctor) => doctor.departmentId === departmentId
  );

  const bookedSlots = new Set(
    state.appointments
      .filter(
        (item) =>
          item.id !== appointment?.id &&
          item.doctorId === doctorId &&
          item.date === date &&
          item.status !== "Cancelled" &&
          item.status !== "No-show"
      )
      .map((item) => item.time)
  );

  const onSubmit = async (values: AppointmentFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const conflict = state.appointments.some(
      (item) =>
        item.id !== appointment?.id &&
        item.doctorId === values.doctorId &&
        item.date === values.date &&
        item.time === values.time &&
        item.status !== "Cancelled" &&
        item.status !== "No-show"
    );
    if (conflict) {
      toast({
        title: "Time slot unavailable",
        description:
          "This doctor is already booked for the selected date and time.",
        tone: "error",
      });
      return;
    }
    const payload: Appointment = {
      ...values,
      notes: values.notes || undefined,
      id:
        appointment?.id ??
        makeId("A", state.appointments.map((item) => item.id)),
    };
    dispatch({
      type: appointment ? "UPDATE_APPOINTMENT" : "ADD_APPOINTMENT",
      payload,
    });
    toast({
      title: appointment ? "Appointment updated" : "Appointment scheduled",
      description:
        "The appointment has been saved and is visible on the schedule.",
    });
    if (onDone) onDone(payload);
    else router.push(`/appointments/${payload.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection
        title="Appointment details"
        description="Choose the patient, department, doctor, and time slot."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Patient" htmlFor="patientId" error={errors.patientId?.message} required>
            <Select id="patientId" {...register("patientId")} invalid={Boolean(errors.patientId)}>
              {state.patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {fullName(patient)} · {patient.mrn}
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
          <FormField label="Doctor" htmlFor="doctorId" error={errors.doctorId?.message} required>
            <Select id="doctorId" {...register("doctorId")} invalid={Boolean(errors.doctorId)}>
              <option value="">Select doctor</option>
              {departmentDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {fullName(doctor)} · {doctor.specialization ?? doctor.role}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Type" htmlFor="type" error={errors.type?.message} required>
            <Select id="type" {...register("type")}>
              {APPOINTMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Date" htmlFor="date" error={errors.date?.message} required>
            <Input
              id="date"
              type="date"
              {...register("date")}
              invalid={Boolean(errors.date)}
              min={appointment ? undefined : new Date().toISOString().slice(0, 10)}
            />
          </FormField>
          <FormField
            label="Time slot"
            htmlFor="time"
            error={errors.time?.message}
            hint={
              doctorId
                ? "Booked slots are disabled for this doctor."
                : "Select a doctor to see availability."
            }
            required
          >
            <Select id="time" {...register("time")} invalid={Boolean(errors.time)}>
              <option value="">Select time</option>
              {APPOINTMENT_SLOTS.map((slot) => (
                <option key={slot} value={slot} disabled={bookedSlots.has(slot)}>
                  {slot}
                  {bookedSlots.has(slot) ? " · booked" : ""}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
            <Select id="status" {...register("status")}>
              {APPOINTMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Reason" htmlFor="reason" error={errors.reason?.message} required>
            <Input id="reason" {...register("reason")} invalid={Boolean(errors.reason)} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Notes" description="Optional context for the care team.">
        <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
          <Textarea id="notes" {...register("notes")} />
        </FormField>
      </FormSection>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {appointment ? "Save changes" : "Schedule appointment"}
        </Button>
      </div>
    </form>
  );
}
