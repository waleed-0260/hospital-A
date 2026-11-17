import { isValid, parseISO } from "date-fns";
import { z } from "zod";

const text = (label: string, min = 1) =>
  z.string().trim().min(min, `${label} is required`);

const numeric = (label: string, allowZero = true) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((value) => Number.isFinite(Number(value)), `${label} must be a number`)
    .refine(
      (value) => (allowZero ? Number(value) >= 0 : Number(value) > 0),
      allowZero ? `${label} cannot be negative` : `${label} must be greater than 0`
    );

const dateValue = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((value) => isValid(parseISO(value)), `${label} must be a valid date`);

const email = z.string().trim().email("Enter a valid email address");

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .regex(/^[0-9+()\-\s]+$/, "Enter a valid phone number");

export const patientSchema = z.object({
  firstName: text("First name"),
  lastName: text("Last name"),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: dateValue("Date of birth"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  phone,
  email,
  address: text("Address"),
  city: text("City"),
  emergencyContactName: text("Emergency contact name"),
  emergencyContactPhone: phone,
  insuranceProvider: z.string().trim(),
  insuranceNumber: z.string().trim(),
  allergies: z.array(z.string().trim().min(1)),
  status: z.enum(["Outpatient", "Admitted", "Discharged"]),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

export const staffSchema = z.object({
  firstName: text("First name"),
  lastName: text("Last name"),
  role: z.enum([
    "Doctor",
    "Nurse",
    "Technician",
    "Pharmacist",
    "Receptionist",
    "Admin",
  ]),
  departmentId: text("Department"),
  specialization: z.string().trim(),
  phone,
  email,
  joinDate: dateValue("Join date"),
  shift: z.enum(["Morning", "Evening", "Night"]),
  status: z.enum(["Active", "On Leave", "Inactive"]),
});

export type StaffFormValues = z.infer<typeof staffSchema>;

export const departmentSchema = z.object({
  name: text("Department name"),
  headStaffId: z.string().trim(),
  description: text("Description"),
  location: text("Location"),
  phone,
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const appointmentSchema = z.object({
  patientId: text("Patient"),
  departmentId: text("Department"),
  doctorId: text("Doctor"),
  date: dateValue("Date"),
  time: text("Time slot"),
  type: z.enum(["Consultation", "Follow-up", "Emergency", "Procedure"]),
  status: z.enum(["Scheduled", "Completed", "Cancelled", "No-show"]),
  reason: text("Reason"),
  notes: z.string().trim(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const prescriptionSchema = z.object({
  medicine: text("Medicine"),
  dosage: text("Dosage"),
  frequency: text("Frequency"),
  duration: text("Duration"),
});

export const recordSchema = z.object({
  patientId: text("Patient"),
  doctorId: text("Doctor"),
  date: dateValue("Date"),
  diagnosis: text("Diagnosis"),
  symptoms: text("Symptoms"),
  treatment: text("Treatment"),
  prescriptions: z.array(prescriptionSchema),
  vitals: z.object({
    bp: text("Blood pressure"),
    heartRate: text("Heart rate"),
    temperature: text("Temperature"),
    weight: text("Weight"),
    height: text("Height"),
    spo2: text("SpO2"),
  }),
  followUpDate: z.string(),
  notes: z.string().trim(),
});

export type RecordFormValues = z.infer<typeof recordSchema>;

export const medicineSchema = z.object({
  name: text("Medicine name"),
  genericName: text("Generic name"),
  category: text("Category"),
  manufacturer: text("Manufacturer"),
  stock: numeric("Stock"),
  reorderLevel: numeric("Reorder level"),
  unitPrice: numeric("Unit price"),
  expiryDate: dateValue("Expiry date"),
});

export type MedicineFormValues = z.infer<typeof medicineSchema>;

export const labOrderSchema = z.object({
  patientId: text("Patient"),
  doctorId: text("Doctor"),
  testName: text("Test"),
  category: text("Category"),
  priority: z.enum(["Routine", "Urgent"]),
  price: numeric("Price"),
});

export type LabOrderFormValues = z.infer<typeof labOrderSchema>;

export const invoiceSchema = z.object({
  patientId: text("Patient"),
  date: dateValue("Invoice date"),
  dueDate: dateValue("Due date"),
  items: z
    .array(
      z.object({
        description: text("Description"),
        quantity: numeric("Quantity", false),
        unitPrice: numeric("Unit price"),
      })
    )
    .min(1, "Add at least one line item"),
  discount: numeric("Discount"),
  tax: numeric("Tax"),
  paymentMethod: z.enum(["Cash", "Card", "Insurance", "Bank Transfer"]),
  paid: numeric("Amount paid"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const settingsSchema = z.object({
  name: text("Hospital name"),
  address: text("Address"),
  phone,
  email,
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export const restockSchema = z.object({
  quantity: numeric("Quantity", false),
});

export type RestockFormValues = z.infer<typeof restockSchema>;

export const paymentSchema = z.object({
  amount: numeric("Amount", false),
  paymentMethod: z.enum(["Cash", "Card", "Insurance", "Bank Transfer"]),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const admitSchema = z.object({
  patientId: text("Patient"),
  admittedAt: dateValue("Admission date"),
});

export type AdmitFormValues = z.infer<typeof admitSchema>;
