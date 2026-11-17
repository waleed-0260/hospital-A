import type { Department, Staff } from "@/types";

export const DEPARTMENT_SEEDS = [
  {
    id: "D01",
    name: "Cardiology",
    description: "Heart and cardiovascular care, diagnostics, and rehabilitation.",
    location: "Floor 3 · East Wing",
    phone: "(555) 310-2100",
    specialization: "Cardiologist",
  },
  {
    id: "D02",
    name: "Neurology",
    description: "Disorders of the brain, spine, and nervous system.",
    location: "Floor 4 · North Wing",
    phone: "(555) 310-2200",
    specialization: "Neurologist",
  },
  {
    id: "D03",
    name: "Orthopedics",
    description: "Bone, joint, and musculoskeletal treatment and surgery.",
    location: "Floor 2 · West Wing",
    phone: "(555) 310-2300",
    specialization: "Orthopedic Surgeon",
  },
  {
    id: "D04",
    name: "Pediatrics",
    description: "Comprehensive medical care for infants, children, and teens.",
    location: "Floor 1 · East Wing",
    phone: "(555) 310-2400",
    specialization: "Pediatrician",
  },
  {
    id: "D05",
    name: "Gynecology",
    description: "Women's health, prenatal care, and reproductive medicine.",
    location: "Floor 5 · South Wing",
    phone: "(555) 310-2500",
    specialization: "Gynecologist",
  },
  {
    id: "D06",
    name: "Emergency",
    description: "24/7 emergency assessment, stabilization, and trauma care.",
    location: "Ground Floor · Main Entrance",
    phone: "(555) 310-2600",
    specialization: "Emergency Physician",
  },
  {
    id: "D07",
    name: "Radiology",
    description: "Medical imaging including X-ray, CT, MRI, and ultrasound.",
    location: "Basement 1 · Imaging Suite",
    phone: "(555) 310-2700",
    specialization: "Radiologist",
  },
  {
    id: "D08",
    name: "General Medicine",
    description: "Primary care, internal medicine, and chronic disease management.",
    location: "Floor 2 · Central Wing",
    phone: "(555) 310-2800",
    specialization: "Internist",
  },
] as const;

export function createDepartments(staff: Staff[]): Department[] {
  return DEPARTMENT_SEEDS.map((seed) => {
    const head =
      staff.find(
        (member) => member.role === "Doctor" && member.departmentId === seed.id
      ) ?? staff.find((member) => member.role === "Doctor");

    return {
      id: seed.id,
      name: seed.name,
      headStaffId: head ? head.id : "",
      description: seed.description,
      location: seed.location,
      phone: seed.phone,
    };
  });
}
