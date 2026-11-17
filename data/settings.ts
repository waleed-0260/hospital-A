import { DEFAULT_HOSPITAL_NAME } from "@/lib/constants";
import type { HospitalSettings } from "@/types";

export function defaultSettings(): HospitalSettings {
  return {
    name: DEFAULT_HOSPITAL_NAME,
    address: "1200 Wellness Boulevard, Springfield, IL 62704",
    phone: "(555) 310-2000",
    email: "care@medicore.example",
    theme: "light",
  };
}
