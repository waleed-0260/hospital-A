import { addDays, format, subDays } from "date-fns";
import { LAB_TEST_CATALOG } from "@/lib/constants";
import { chance, createRng, pick, randomInt } from "./random";
import type { LabStatus, LabTest, Patient, Staff } from "@/types";

const results = [
  "Within normal limits.",
  "Mild elevation observed; repeat test recommended in 2 weeks.",
  "Abnormal values detected. Clinical correlation advised.",
  "No significant findings.",
  "Positive for mild infection. Follow-up advised.",
  "Borderline result; monitor and retest.",
];

export function createLabTests(
  patients: Patient[],
  staff: Staff[]
): LabTest[] {
  const rng = createRng(667788);
  const doctors = staff.filter((member) => member.role === "Doctor");
  const tests: LabTest[] = [];

  for (let index = 0; index < 12; index += 1) {
    const catalog = pick(rng, LAB_TEST_CATALOG);
    const patient = patients[(index * 3) % patients.length];
    const doctor = doctors[index % doctors.length];
    const orderedAt = subDays(new Date(), randomInt(rng, 0, 30));
    const status: LabStatus =
      index < 6 ? "Completed" : index < 9 ? "In Progress" : "Pending";
    const completed = status === "Completed";

    tests.push({
      id: `L${String(index + 1).padStart(3, "0")}`,
      patientId: patient.id,
      doctorId: doctor.id,
      testName: catalog.name,
      category: catalog.category,
      orderedAt: orderedAt.toISOString(),
      status,
      result: completed ? pick(rng, results) : undefined,
      resultDate: completed
        ? format(addDays(orderedAt, randomInt(rng, 0, 2)), "yyyy-MM-dd")
        : undefined,
      priority: chance(rng, 0.3) ? "Urgent" : "Routine",
      price: catalog.price,
    });
  }

  return tests.sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
}
