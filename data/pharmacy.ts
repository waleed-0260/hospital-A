import { addDays, addMonths, format, subDays } from "date-fns";
import { createRng, randomInt } from "./random";
import type { Medicine } from "@/types";

const seeds: Array<{
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  price: number;
}> = [
  { name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "Antibiotic", manufacturer: "Pfizer", price: 0.45 },
  { name: "Azithromycin 250mg", genericName: "Azithromycin dihydrate", category: "Antibiotic", manufacturer: "Sandoz", price: 1.2 },
  { name: "Lisinopril 10mg", genericName: "Lisinopril", category: "Antihypertensive", manufacturer: "Merck", price: 0.3 },
  { name: "Amlodipine 5mg", genericName: "Amlodipine besylate", category: "Antihypertensive", manufacturer: "Norvasc", price: 0.25 },
  { name: "Metformin 500mg", genericName: "Metformin HCl", category: "Antidiabetic", manufacturer: "Bristol Myers", price: 0.18 },
  { name: "Glimepiride 2mg", genericName: "Glimepiride", category: "Antidiabetic", manufacturer: "Sanofi", price: 0.35 },
  { name: "Atorvastatin 20mg", genericName: "Atorvastatin calcium", category: "Cardiovascular", manufacturer: "Lipitor", price: 0.6 },
  { name: "Losartan 50mg", genericName: "Losartan potassium", category: "Antihypertensive", manufacturer: "Teva", price: 0.32 },
  { name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "Anti-inflammatory", manufacturer: "Advil", price: 0.12 },
  { name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "Analgesic", manufacturer: "Tylenol", price: 0.08 },
  { name: "Omeprazole 20mg", genericName: "Omeprazole", category: "Gastrointestinal", manufacturer: "AstraZeneca", price: 0.22 },
  { name: "Salbutamol Inhaler", genericName: "Albuterol sulfate", category: "Respiratory", manufacturer: "Ventolin", price: 8.5 },
];

const lowStockIndexes = new Set([0, 3, 6, 9]);
const nearExpiryIndexes = new Set([2, 7]);
const expiredIndexes = new Set([5]);

export function createMedicines(): Medicine[] {
  const rng = createRng(332211);
  const now = new Date();

  return seeds.map((seed, index) => {
    const reorderLevel = randomInt(rng, 20, 60);
    const stock = lowStockIndexes.has(index)
      ? randomInt(rng, 2, Math.max(8, reorderLevel - 4))
      : randomInt(rng, 60, 480);

    let expiryDate: string;
    if (expiredIndexes.has(index)) {
      expiryDate = format(subDays(now, randomInt(rng, 5, 60)), "yyyy-MM-dd");
    } else if (nearExpiryIndexes.has(index)) {
      expiryDate = format(addDays(now, randomInt(rng, 10, 85)), "yyyy-MM-dd");
    } else {
      expiryDate = format(addMonths(now, randomInt(rng, 6, 36)), "yyyy-MM-dd");
    }

    return {
      id: `M${String(index + 1).padStart(3, "0")}`,
      name: seed.name,
      genericName: seed.genericName,
      category: seed.category,
      manufacturer: seed.manufacturer,
      stock,
      reorderLevel,
      unitPrice: seed.price,
      expiryDate,
    };
  });
}
