import { format, subDays } from "date-fns";
import { SPECIALIZATIONS } from "@/lib/constants";
import { DEPARTMENT_SEEDS } from "./departments";
import { chance, createRng, pick, randomInt } from "./random";
import type { Staff, StaffRole, StaffStatus } from "@/types";

const doctorSeeds = [
  { firstName: "Sarah", lastName: "Mitchell", departmentId: "D01" },
  { firstName: "James", lastName: "Okafor", departmentId: "D02" },
  { firstName: "Priya", lastName: "Nair", departmentId: "D03" },
  { firstName: "Daniel", lastName: "Kim", departmentId: "D04" },
  { firstName: "Amara", lastName: "Hassan", departmentId: "D05" },
  { firstName: "Lucas", lastName: "Fernandez", departmentId: "D06" },
  { firstName: "Emily", lastName: "Chen", departmentId: "D07" },
  { firstName: "Michael", lastName: "Adeyemi", departmentId: "D08" },
];

const nurseSeeds = [
  { firstName: "Grace", lastName: "Bennett", departmentId: "D01" },
  { firstName: "Oliver", lastName: "Hughes", departmentId: "D06" },
];

const technicianSeeds = [
  { firstName: "Victor", lastName: "Nguyen", departmentId: "D07" },
];

const pharmacistSeeds = [
  { firstName: "Aisha", lastName: "Bello", departmentId: "D08" },
];

const receptionistSeeds = [
  { firstName: "Emma", lastName: "Collins", departmentId: "D06" },
];

function makeStaff(
  rng: () => number,
  seeds: Array<{ firstName: string; lastName: string; departmentId: string }>,
  role: StaffRole,
  startIndex: number
): Staff[] {
  return seeds.map((seed, index) => {
    const number = startIndex + index;
    return {
      id: `S${String(number).padStart(3, "0")}`,
      employeeId: `EMP-${1000 + number}`,
      firstName: seed.firstName,
      lastName: seed.lastName,
      role,
      departmentId: seed.departmentId,
      specialization: undefined,
      phone: `(555) ${String(400 + number).padStart(3, "0")}-${String(
        1000 + ((number * 173) % 9000)
      ).padStart(4, "0")}`,
      email: `${seed.firstName.toLowerCase()}.${seed.lastName.toLowerCase()}@medicore.example`,
      joinDate: format(subDays(new Date(), randomInt(rng, 120, 3200)), "yyyy-MM-dd"),
      shift: pick(rng, ["Morning", "Evening", "Night"] as const),
      status: "Active",
    };
  });
}

export function createStaff(): Staff[] {
  const rng = createRng(773311);
  const doctors = makeStaff(rng, doctorSeeds, "Doctor", 1);
  doctors.forEach((doctor) => {
    const seed = DEPARTMENT_SEEDS.find(
      (department) => department.id === doctor.departmentId
    );
    doctor.specialization = seed ? seed.specialization : pick(rng, SPECIALIZATIONS);
  });

  const nurses = makeStaff(rng, nurseSeeds, "Nurse", 9);
  const technicians = makeStaff(rng, technicianSeeds, "Technician", 11);
  const pharmacists = makeStaff(rng, pharmacistSeeds, "Pharmacist", 12);
  const receptionists = makeStaff(rng, receptionistSeeds, "Receptionist", 13);

  const staff = [
    ...doctors,
    ...nurses,
    ...technicians,
    ...pharmacists,
    ...receptionists,
  ];

  const changes: Record<string, StaffStatus> = {
    S010: "On Leave",
  };

  for (const member of staff) {
    if (changes[member.id]) member.status = changes[member.id];
    else if (chance(rng, 0.12)) member.status = "On Leave";
  }

  return staff;
}
