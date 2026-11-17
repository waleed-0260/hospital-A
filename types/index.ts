export type Gender = "Male" | "Female" | "Other";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type PatientStatus = "Outpatient" | "Admitted" | "Discharged";

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  allergies: string[];
  status: PatientStatus;
  registeredAt: string;
}

export type StaffRole =
  | "Doctor"
  | "Nurse"
  | "Technician"
  | "Pharmacist"
  | "Receptionist"
  | "Admin";

export type Shift = "Morning" | "Evening" | "Night";

export type StaffStatus = "Active" | "On Leave" | "Inactive";

export interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  departmentId: string;
  specialization?: string;
  phone: string;
  email: string;
  joinDate: string;
  shift: Shift;
  status: StaffStatus;
}

export interface Department {
  id: string;
  name: string;
  headStaffId: string;
  description: string;
  location: string;
  phone: string;
}

export type AppointmentType =
  | "Consultation"
  | "Follow-up"
  | "Emergency"
  | "Procedure";

export type AppointmentStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled"
  | "No-show";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
}

export interface Prescription {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Vitals {
  bp: string;
  heartRate: string;
  temperature: string;
  weight: string;
  height: string;
  spo2: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescriptions: Prescription[];
  vitals: Vitals;
  followUpDate?: string;
  notes?: string;
}

export type WardType =
  | "General"
  | "ICU"
  | "Private"
  | "Emergency"
  | "Maternity"
  | "Pediatric";

export interface Ward {
  id: string;
  name: string;
  type: WardType;
  floor: string;
  totalBeds: number;
}

export type BedStatus = "Available" | "Occupied" | "Maintenance";

export interface Bed {
  id: string;
  wardId: string;
  bedNumber: string;
  status: BedStatus;
  patientId?: string;
  admittedAt?: string;
}

export type LabStatus = "Pending" | "In Progress" | "Completed";

export type LabPriority = "Routine" | "Urgent";

export interface LabTest {
  id: string;
  patientId: string;
  doctorId: string;
  testName: string;
  category: string;
  orderedAt: string;
  status: LabStatus;
  result?: string;
  resultDate?: string;
  priority: LabPriority;
  price: number;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  stock: number;
  reorderLevel: number;
  unitPrice: number;
  expiryDate: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceStatus = "Paid" | "Partial" | "Unpaid" | "Overdue";

export type PaymentMethod =
  | "Cash"
  | "Card"
  | "Insurance"
  | "Bank Transfer";

export interface Invoice {
  id: string;
  invoiceNo: string;
  patientId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number;
  tax: number;
  total: number;
  paid: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
}

export interface HospitalSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  theme: "light" | "dark";
}

export interface HospitalData {
  patients: Patient[];
  staff: Staff[];
  departments: Department[];
  appointments: Appointment[];
  records: MedicalRecord[];
  wards: Ward[];
  beds: Bed[];
  labTests: LabTest[];
  medicines: Medicine[];
  invoices: Invoice[];
  settings: HospitalSettings;
}
