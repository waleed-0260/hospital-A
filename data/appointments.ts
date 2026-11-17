import { addDays, format } from "date-fns";
import { APPOINTMENT_SLOTS, APPOINTMENT_TYPES } from "@/lib/constants";
import { chance, createRng, pick, randomInt } from "./random";
import type { Appointment, AppointmentStatus, Patient, Staff } from "@/types";

const reasons = [
  "Chest pain evaluation",
  "Routine follow-up",
  "Persistent headache",
  "Knee pain assessment",
  "Childhood vaccination review",
  "Prenatal checkup",
  "Post-operative review",
  "Medication adjustment",
  "Shortness of breath",
  "Annual wellness visit",
  "Fever and fatigue",
  "Skin rash consultation",
  "Blood pressure monitoring",
  "Imaging results discussion",
];

function statusForPast(rng: () => number): AppointmentStatus {
  const value = rng();
  if (value < 0.68) return "Completed";
  if (value < 0.84) return "Cancelled";
  return "No-show";
}

function statusForToday(rng: () => number): AppointmentStatus {
  const value = rng();
  if (value < 0.5) return "Scheduled";
  if (value < 0.82) return "Completed";
  if (value < 0.92) return "Cancelled";
  return "No-show";
}

function statusForFuture(rng: () => number): AppointmentStatus {
  return chance(rng, 0.9) ? "Scheduled" : "Cancelled";
}

export function createAppointments(
  patients: Patient[],
  staff: Staff[]
): Appointment[] {
  const rng = createRng(918273);
  const doctors = staff.filter((member) => member.role === "Doctor");
  const appointments: Appointment[] = [];
  const booked = new Set<string>();
  const today = new Date();

  const pickSlot = (doctorId: string, date: string, start: number): string => {
    for (let attempt = 0; attempt < APPOINTMENT_SLOTS.length; attempt += 1) {
      const slot =
        APPOINTMENT_SLOTS[(start + attempt) % APPOINTMENT_SLOTS.length];
      const key = `${doctorId}|${date}|${slot}`;
      if (!booked.has(key)) {
        booked.add(key);
        return slot;
      }
    }
    return APPOINTMENT_SLOTS[start % APPOINTMENT_SLOTS.length];
  };

  const addAppointment = (
    index: number,
    offsetDays: number,
    forcedStatus?: AppointmentStatus
  ) => {
    const doctor = doctors[index % doctors.length];
    const patient = patients[(index * 7) % patients.length];
    const dateObj = addDays(today, offsetDays);
    const date = format(dateObj, "yyyy-MM-dd");
    const time = pickSlot(doctor.id, date, index * 3);
    const status =
      forcedStatus ??
      (offsetDays < 0
        ? statusForPast(rng)
        : offsetDays === 0
          ? statusForToday(rng)
          : statusForFuture(rng));

    appointments.push({
      id: `A${String(appointments.length + 1).padStart(3, "0")}`,
      patientId: patient.id,
      doctorId: doctor.id,
      departmentId: doctor.departmentId,
      date,
      time,
      type: pick(rng, APPOINTMENT_TYPES),
      status,
      reason: pick(rng, reasons),
      notes: chance(rng, 0.3)
        ? "Patient advised to bring previous reports and medication list."
        : undefined,
    });
  };

  for (let index = 0; index < 5; index += 1) {
    addAppointment(
      index,
      0,
      index === 2 ? "Completed" : index === 4 ? "Cancelled" : "Scheduled"
    );
  }

  for (let index = 5; index < 11; index += 1) {
    addAppointment(index, -randomInt(rng, 1, 30));
  }

  for (let index = 11; index < 13; index += 1) {
    addAppointment(index, 0);
  }

  for (let index = 13; index < 18; index += 1) {
    addAppointment(index, randomInt(rng, 1, 30));
  }

  return appointments.sort((a, b) =>
    `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)
  );
}
