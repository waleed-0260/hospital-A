import { addDays, format, subDays, subYears } from "date-fns";
import { BLOOD_GROUPS, ALLERGY_OPTIONS } from "@/lib/constants";
import { chance, createRng, pick, pickMany, randomInt } from "./random";
import type { Patient } from "@/types";

const maleNames = [
  "James",
  "John",
  "Robert",
  "Michael",
  "William",
  "David",
  "Richard",
  "Joseph",
  "Thomas",
  "Charles",
  "Christopher",
  "Daniel",
  "Matthew",
  "Anthony",
  "Mark",
  "Steven",
  "Paul",
  "Andrew",
  "Joshua",
  "Kenneth",
];

const femaleNames = [
  "Mary",
  "Patricia",
  "Jennifer",
  "Linda",
  "Elizabeth",
  "Barbara",
  "Susan",
  "Jessica",
  "Sarah",
  "Karen",
  "Nancy",
  "Lisa",
  "Betty",
  "Margaret",
  "Sandra",
  "Ashley",
  "Kimberly",
  "Emily",
  "Donna",
  "Michelle",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
];

const cities = [
  "Springfield",
  "Riverside",
  "Franklin",
  "Greenville",
  "Clinton",
  "Fairview",
  "Madison",
  "Georgetown",
  "Salem",
  "Arlington",
];

const streets = [
  "Oak",
  "Maple",
  "Cedar",
  "Pine",
  "Elm",
  "Washington",
  "Lake",
  "Hill",
  "Park",
  "Sunset",
];

const insuranceProviders = [
  "BlueCross Shield",
  "Aetna Health",
  "UnitedCare",
  "Cigna Plus",
  "MediTrust",
];

export function createPatients(): Patient[] {
  const rng = createRng(20240117);
  const patients: Patient[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i += 1) {
    const gender = i % 2 === 0 ? "Female" : "Male";
    const firstName =
      gender === "Female" ? femaleNames[i / 2] : maleNames[(i - 1) / 2];
    const lastName = lastNames[i % lastNames.length];
    const age = randomInt(rng, 4, 88);
    const dob = format(
      addDays(subYears(now, age), -randomInt(rng, 0, 340)),
      "yyyy-MM-dd"
    );
    const registeredAt = subDays(now, randomInt(rng, 0, 730)).toISOString();
    const hasInsurance = chance(rng, 0.62);
    const hasAllergies = chance(rng, 0.38);

    let status: Patient["status"] = "Outpatient";
    if (i < 6) status = "Admitted";
    else if (i < 9) status = "Discharged";

    patients.push({
      id: `P${String(i + 1).padStart(3, "0")}`,
      mrn: `MRN-${String(1001 + i)}`,
      firstName,
      lastName,
      gender,
      dob,
      bloodGroup: pick(rng, BLOOD_GROUPS),
      phone: `(555) ${String(100 + i).padStart(3, "0")}-${String(
        1000 + ((i * 137) % 9000)
      ).padStart(4, "0")}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      address: `${randomInt(rng, 10, 980)} ${pick(rng, streets)} Street`,
      city: pick(rng, cities),
      emergencyContactName: `${pick(rng, [...maleNames, ...femaleNames])} ${lastName}`,
      emergencyContactPhone: `(555) ${String(200 + i).padStart(3, "0")}-${String(
        2000 + ((i * 211) % 8000)
      ).padStart(4, "0")}`,
      insuranceProvider: hasInsurance ? pick(rng, insuranceProviders) : undefined,
      insuranceNumber: hasInsurance ? `INS-${700000 + i * 37}` : undefined,
      allergies: hasAllergies ? pickMany(rng, ALLERGY_OPTIONS, randomInt(rng, 1, 2)) : [],
      status,
      registeredAt,
    });
  }

  return patients;
}
