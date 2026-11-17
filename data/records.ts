import { format, subDays, addDays } from "date-fns";
import { chance, createRng, pick, randomInt } from "./random";
import type { MedicalRecord, Patient, Staff } from "@/types";

const diagnoses = [
  "Acute bronchitis",
  "Essential hypertension",
  "Type 2 diabetes mellitus",
  "Migraine without aura",
  "Osteoarthritis of the knee",
  "Community-acquired pneumonia",
  "Gastroesophageal reflux disease",
  "Iron-deficiency anemia",
  "Urinary tract infection",
  "Asthma exacerbation",
  "Atrial fibrillation",
  "Lumbar disc herniation",
  "Acute gastroenteritis",
  "Allergic rhinitis",
  "Hypothyroidism",
];

const symptomsList = [
  "Cough, low-grade fever, and chest congestion",
  "Recurring headaches with light sensitivity",
  "Joint pain and stiffness, worse in the morning",
  "Shortness of breath and fatigue",
  "Epigastric burning after meals",
  "Dizziness and palpitations",
  "Frequent urination and excessive thirst",
  "Lower back pain radiating to the leg",
  "Nausea, vomiting, and abdominal cramps",
  "Sneezing, itchy eyes, and nasal congestion",
];

const treatmentsList = [
  "Supportive care with hydration and rest.",
  "Medication adjustment and lifestyle counseling.",
  "Physiotherapy referral and analgesia.",
  "Inhaled therapy with follow-up in two weeks.",
  "Antibiotic course and monitoring of symptoms.",
  "Dietary modification and glucose monitoring.",
  "Cardiology review scheduled with ECG monitoring.",
  "Conservative management with gradual mobilization.",
];

const medicineNames = [
  "Amoxicillin 500mg",
  "Lisinopril 10mg",
  "Metformin 500mg",
  "Atorvastatin 20mg",
  "Ibuprofen 400mg",
  "Omeprazole 20mg",
  "Salbutamol Inhaler",
  "Paracetamol 500mg",
  "Amlodipine 5mg",
  "Levothyroxine 50mcg",
  "Losartan 50mg",
  "Cetirizine 10mg",
];

const dosages = ["1 tablet", "2 tablets", "5 ml", "10 ml", "1 puff"];
const frequencies = ["Once daily", "Twice daily", "Three times daily", "As needed"];
const durations = ["5 days", "7 days", "10 days", "14 days", "30 days"];

export function createRecords(
  patients: Patient[],
  staff: Staff[]
): MedicalRecord[] {
  const rng = createRng(445566);
  const doctors = staff.filter((member) => member.role === "Doctor");
  const records: MedicalRecord[] = [];

  for (let index = 0; index < 12; index += 1) {
    const patient = patients[index % patients.length];
    const doctor = doctors[index % doctors.length];
    const dateObj = subDays(new Date(), randomInt(rng, 0, 150));
    const prescriptionCount = randomInt(rng, 1, 2);

    records.push({
      id: `R${String(index + 1).padStart(3, "0")}`,
      patientId: patient.id,
      doctorId: doctor.id,
      date: format(dateObj, "yyyy-MM-dd"),
      diagnosis: pick(rng, diagnoses),
      symptoms: pick(rng, symptomsList),
      treatment: pick(rng, treatmentsList),
      prescriptions: Array.from({ length: prescriptionCount }, () => ({
        medicine: pick(rng, medicineNames),
        dosage: pick(rng, dosages),
        frequency: pick(rng, frequencies),
        duration: pick(rng, durations),
      })),
      vitals: {
        bp: `${randomInt(rng, 105, 152)}/${randomInt(rng, 66, 96)} mmHg`,
        heartRate: `${randomInt(rng, 60, 102)} bpm`,
        temperature: `${(randomInt(rng, 970, 1010) / 10).toFixed(1)} °C`,
        weight: `${randomInt(rng, 45, 108)} kg`,
        height: `${randomInt(rng, 150, 196)} cm`,
        spo2: `${randomInt(rng, 94, 100)}%`,
      },
      followUpDate: chance(rng, 0.4)
        ? format(addDays(dateObj, randomInt(rng, 7, 30)), "yyyy-MM-dd")
        : undefined,
      notes: chance(rng, 0.35)
        ? "Patient responded well to treatment. Advised to return if symptoms worsen."
        : undefined,
    });
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
}
