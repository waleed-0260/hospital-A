import type {
  AppointmentStatus,
  AppointmentType,
  BloodGroup,
  Gender,
  InvoiceStatus,
  LabPriority,
  LabStatus,
  PatientStatus,
  PaymentMethod,
  Shift,
  StaffRole,
  StaffStatus,
  WardType,
} from "@/types";

export const APP_NAME = "MediCore HMS";
export const APP_VERSION = "1.0.0";
export const DEFAULT_HOSPITAL_NAME = "MediCore General Hospital";
export const PAGE_SIZE = 10;
export const LOW_STOCK_LIMIT = 20;
export const EXPIRY_WINDOW_DAYS = 90;

export const APP_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Patients", href: "/patients", icon: "Users" },
  { label: "Appointments", href: "/appointments", icon: "CalendarDays" },
  { label: "Medical Records", href: "/records", icon: "FileText" },
  { label: "Staff", href: "/staff", icon: "Stethoscope" },
  { label: "Departments", href: "/departments", icon: "Building2" },
  { label: "Wards & Beds", href: "/wards", icon: "BedDouble" },
  { label: "Laboratory", href: "/laboratory", icon: "FlaskConical" },
  { label: "Pharmacy", href: "/pharmacy", icon: "Pill" },
  { label: "Billing", href: "/billing", icon: "ReceiptText" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

export const GENDERS: Gender[] = ["Male", "Female", "Other"];

export const BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export const PATIENT_STATUSES: PatientStatus[] = [
  "Outpatient",
  "Admitted",
  "Discharged",
];

export const STAFF_ROLES: StaffRole[] = [
  "Doctor",
  "Nurse",
  "Technician",
  "Pharmacist",
  "Receptionist",
  "Admin",
];

export const SHIFTS: Shift[] = ["Morning", "Evening", "Night"];

export const STAFF_STATUSES: StaffStatus[] = ["Active", "On Leave", "Inactive"];

export const APPOINTMENT_TYPES: AppointmentType[] = [
  "Consultation",
  "Follow-up",
  "Emergency",
  "Procedure",
];

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "Scheduled",
  "Completed",
  "Cancelled",
  "No-show",
];

export const APPOINTMENT_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

export const WARD_TYPES: WardType[] = [
  "General",
  "ICU",
  "Private",
  "Emergency",
  "Maternity",
  "Pediatric",
];

export const LAB_STATUSES: LabStatus[] = ["Pending", "In Progress", "Completed"];

export const LAB_PRIORITIES: LabPriority[] = ["Routine", "Urgent"];

export const LAB_TEST_CATALOG = [
  { name: "Complete Blood Count", category: "Hematology", price: 45 },
  { name: "Basic Metabolic Panel", category: "Chemistry", price: 60 },
  { name: "Lipid Profile", category: "Chemistry", price: 55 },
  { name: "Liver Function Test", category: "Chemistry", price: 70 },
  { name: "Thyroid Panel", category: "Endocrinology", price: 85 },
  { name: "HbA1c", category: "Endocrinology", price: 40 },
  { name: "Urinalysis", category: "Microbiology", price: 25 },
  { name: "Blood Culture", category: "Microbiology", price: 95 },
  { name: "Chest X-Ray", category: "Radiology", price: 120 },
  { name: "MRI Brain", category: "Radiology", price: 650 },
  { name: "CT Abdomen", category: "Radiology", price: 420 },
  { name: "ECG", category: "Cardiology", price: 50 },
  { name: "Troponin I", category: "Cardiology", price: 75 },
  { name: "COVID-19 PCR", category: "Microbiology", price: 110 },
  { name: "Vitamin D", category: "Chemistry", price: 65 },
  { name: "Coagulation Profile", category: "Hematology", price: 80 },
];

export const MEDICINE_CATEGORIES = [
  "Analgesic",
  "Antibiotic",
  "Antiviral",
  "Antidiabetic",
  "Antihypertensive",
  "Anti-inflammatory",
  "Cardiovascular",
  "Respiratory",
  "Gastrointestinal",
  "Vitamin",
  "Vaccine",
  "Other",
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "Card",
  "Insurance",
  "Bank Transfer",
];

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "Paid",
  "Partial",
  "Unpaid",
  "Overdue",
];

export const ALLERGY_OPTIONS = [
  "Penicillin",
  "Peanuts",
  "Latex",
  "Aspirin",
  "Sulfa drugs",
  "Shellfish",
  "Dust",
  "Pollen",
];

export const SPECIALIZATIONS = [
  "Cardiologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Gynecologist",
  "Emergency Physician",
  "Radiologist",
  "Internist",
  "Anesthesiologist",
  "General Surgeon",
];

export type BadgeTone =
  | "teal"
  | "green"
  | "blue"
  | "amber"
  | "red"
  | "slate"
  | "purple";

export const STATUS_TONES: Record<string, BadgeTone> = {
  Outpatient: "blue",
  Admitted: "amber",
  Discharged: "slate",
  Active: "green",
  "On Leave": "amber",
  Inactive: "slate",
  Scheduled: "blue",
  Completed: "green",
  Cancelled: "red",
  "No-show": "slate",
  Available: "green",
  Occupied: "red",
  Maintenance: "amber",
  Pending: "amber",
  "In Progress": "blue",
  Routine: "slate",
  Urgent: "red",
  Paid: "green",
  Partial: "amber",
  Unpaid: "red",
  Overdue: "red",
  Consultation: "blue",
  "Follow-up": "teal",
  Emergency: "red",
  Procedure: "purple",
  Doctor: "teal",
  Nurse: "purple",
  Technician: "blue",
  Pharmacist: "green",
  Receptionist: "slate",
  Admin: "slate",
  Male: "blue",
  Female: "purple",
};

export function statusTone(status: string): BadgeTone {
  return STATUS_TONES[status] ?? "slate";
}
