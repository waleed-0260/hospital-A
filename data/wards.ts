import { subDays } from "date-fns";
import { createRng, randomInt } from "./random";
import type { Bed, Patient, Ward } from "@/types";

const wardSeeds: Array<{
  id: string;
  name: string;
  type: Ward["type"];
  floor: string;
  totalBeds: number;
  prefix: string;
}> = [
  { id: "W01", name: "General Ward A", type: "General", floor: "Floor 2", totalBeds: 4, prefix: "GA" },
  { id: "W02", name: "Intensive Care Unit", type: "ICU", floor: "Floor 3", totalBeds: 3, prefix: "ICU" },
  { id: "W03", name: "Private Suites", type: "Private", floor: "Floor 5", totalBeds: 3, prefix: "PV" },
  { id: "W04", name: "Emergency Observation", type: "Emergency", floor: "Ground Floor", totalBeds: 3, prefix: "ER" },
  { id: "W05", name: "Maternity Ward", type: "Maternity", floor: "Floor 4", totalBeds: 3, prefix: "MT" },
  { id: "W06", name: "Pediatric Ward", type: "Pediatric", floor: "Floor 1", totalBeds: 2, prefix: "PD" },
];

export function createWards(patients: Patient[]): { wards: Ward[]; beds: Bed[] } {
  const rng = createRng(554433);
  const wards: Ward[] = wardSeeds.map((seed) => ({
    id: seed.id,
    name: seed.name,
    type: seed.type,
    floor: seed.floor,
    totalBeds: seed.totalBeds,
  }));

  const beds: Bed[] = [];
  for (const seed of wardSeeds) {
    for (let index = 1; index <= seed.totalBeds; index += 1) {
      beds.push({
        id: `${seed.id}-${String(index).padStart(2, "0")}`,
        wardId: seed.id,
        bedNumber: `${seed.prefix}-${String(index).padStart(2, "0")}`,
        status: "Available",
      });
    }
  }

  const maintenance = new Set(["W01-04", "W06-01"]);
  for (const bed of beds) {
    if (maintenance.has(bed.id)) bed.status = "Maintenance";
  }

  const admitted = patients.filter((patient) => patient.status === "Admitted");
  const available = beds.filter((bed) => bed.status === "Available");
  const pools = wards.map((ward) =>
    available.filter((bed) => bed.wardId === ward.id)
  );
  const preferredOrder: Bed[] = [];
  const maxPerWard = Math.max(...pools.map((pool) => pool.length), 0);
  for (let round = 0; round < maxPerWard; round += 1) {
    for (const pool of pools) {
      if (pool[round]) preferredOrder.push(pool[round]);
    }
  }

  admitted.forEach((patient, index) => {
    const bed = preferredOrder[index];
    if (!bed) return;
    bed.status = "Occupied";
    bed.patientId = patient.id;
    bed.admittedAt = subDays(new Date(), randomInt(rng, 1, 12)).toISOString();
  });

  return { wards, beds };
}
