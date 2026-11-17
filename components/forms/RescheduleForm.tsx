"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { APPOINTMENT_SLOTS } from "@/lib/constants";
import type { Appointment } from "@/types";

const rescheduleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time slot is required"),
});

type RescheduleValues = z.infer<typeof rescheduleSchema>;

interface RescheduleFormProps {
  appointment: Appointment;
  onDone: () => void;
  onCancel: () => void;
}

export function RescheduleForm({
  appointment,
  onDone,
  onCancel,
}: RescheduleFormProps) {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: { date: appointment.date, time: appointment.time },
  });

  const date = useWatch({ control, name: "date" });
  const booked = new Set(
    state.appointments
      .filter(
        (item) =>
          item.id !== appointment.id &&
          item.doctorId === appointment.doctorId &&
          item.date === date &&
          item.status !== "Cancelled" &&
          item.status !== "No-show"
      )
      .map((item) => item.time)
  );

  const onSubmit = async (values: RescheduleValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    if (booked.has(values.time)) {
      toast({
        title: "Slot unavailable",
        description: "Choose another time for this doctor.",
        tone: "error",
      });
      return;
    }
    dispatch({
      type: "UPDATE_APPOINTMENT",
      payload: {
        ...appointment,
        date: values.date,
        time: values.time,
        status: "Scheduled",
      },
    });
    toast({
      title: "Appointment rescheduled",
      description: `New time: ${values.date} at ${values.time}.`,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="New date" htmlFor="date" error={errors.date?.message} required>
        <Input id="date" type="date" {...register("date")} invalid={Boolean(errors.date)} />
      </FormField>
      <FormField label="New time slot" htmlFor="time" error={errors.time?.message} required>
        <Select id="time" {...register("time")} invalid={Boolean(errors.time)}>
          {APPOINTMENT_SLOTS.map((slot) => (
            <option key={slot} value={slot} disabled={booked.has(slot)}>
              {slot}
              {booked.has(slot) ? " · booked" : ""}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Reschedule
        </Button>
      </div>
    </form>
  );
}
