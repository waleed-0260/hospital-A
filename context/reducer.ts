import { isBefore, parseISO, startOfDay } from "date-fns";
import { createInitialData } from "@/data";
import { roundMoney } from "@/lib/utils";
import type {
  Appointment,
  Bed,
  Department,
  HospitalData,
  HospitalSettings,
  Invoice,
  InvoiceStatus,
  LabTest,
  MedicalRecord,
  Medicine,
  Patient,
  PaymentMethod,
  Staff,
  Ward,
} from "@/types";

export type HospitalAction =
  | { type: "HYDRATE"; payload: HospitalData }
  | { type: "RESET_DATA" }
  | { type: "ADD_PATIENT"; payload: Patient }
  | { type: "UPDATE_PATIENT"; payload: Patient }
  | { type: "DELETE_PATIENT"; payload: string }
  | { type: "ADD_STAFF"; payload: Staff }
  | { type: "UPDATE_STAFF"; payload: Staff }
  | { type: "DELETE_STAFF"; payload: string }
  | { type: "ADD_DEPARTMENT"; payload: Department }
  | { type: "UPDATE_DEPARTMENT"; payload: Department }
  | { type: "DELETE_DEPARTMENT"; payload: string }
  | { type: "ADD_APPOINTMENT"; payload: Appointment }
  | { type: "UPDATE_APPOINTMENT"; payload: Appointment }
  | { type: "DELETE_APPOINTMENT"; payload: string }
  | { type: "ADD_RECORD"; payload: MedicalRecord }
  | { type: "UPDATE_RECORD"; payload: MedicalRecord }
  | { type: "DELETE_RECORD"; payload: string }
  | { type: "ADD_WARD"; payload: Ward }
  | { type: "UPDATE_WARD"; payload: Ward }
  | { type: "DELETE_WARD"; payload: string }
  | { type: "UPDATE_BED"; payload: Bed }
  | { type: "ADD_LAB_TEST"; payload: LabTest }
  | { type: "UPDATE_LAB_TEST"; payload: LabTest }
  | { type: "DELETE_LAB_TEST"; payload: string }
  | { type: "ADD_MEDICINE"; payload: Medicine }
  | { type: "UPDATE_MEDICINE"; payload: Medicine }
  | { type: "DELETE_MEDICINE"; payload: string }
  | { type: "RESTOCK_MEDICINE"; payload: { id: string; quantity: number } }
  | { type: "ADD_INVOICE"; payload: Invoice }
  | { type: "UPDATE_INVOICE"; payload: Invoice }
  | { type: "DELETE_INVOICE"; payload: string }
  | {
      type: "RECORD_PAYMENT";
      payload: { id: string; amount: number; paymentMethod: PaymentMethod };
    }
  | {
      type: "ADMIT_PATIENT";
      payload: { patientId: string; bedId: string; admittedAt: string };
    }
  | { type: "DISCHARGE_PATIENT"; payload: { patientId: string } }
  | {
      type: "TRANSFER_PATIENT";
      payload: { patientId: string; toBedId: string; admittedAt: string };
    }
  | { type: "UPDATE_SETTINGS"; payload: Partial<HospitalSettings> };

export function recalcInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.paid >= invoice.total - 0.005) return "Paid";
  const due = parseISO(invoice.dueDate);
  if (isBefore(due, startOfDay(new Date())) && invoice.paid < invoice.total) {
    return "Overdue";
  }
  return invoice.paid > 0 ? "Partial" : "Unpaid";
}

function replaceById<T extends { id: string }>(items: T[], item: T): T[] {
  return items.map((current) => (current.id === item.id ? item : current));
}

function freeBedsForPatient(beds: Bed[], patientId: string): Bed[] {
  return beds.map((bed) =>
    bed.patientId === patientId
      ? {
          ...bed,
          status: "Available" as const,
          patientId: undefined,
          admittedAt: undefined,
        }
      : bed
  );
}

export function hospitalReducer(
  state: HospitalData,
  action: HospitalAction
): HospitalData {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "RESET_DATA": {
      const fresh = createInitialData();
      return {
        ...fresh,
        settings: {
          ...fresh.settings,
          theme: state.settings.theme,
        },
      };
    }
    case "ADD_PATIENT":
      return { ...state, patients: [action.payload, ...state.patients] };
    case "UPDATE_PATIENT":
      return {
        ...state,
        patients: replaceById(state.patients, action.payload),
      };
    case "DELETE_PATIENT":
      return {
        ...state,
        patients: state.patients.filter((item) => item.id !== action.payload),
        appointments: state.appointments.filter(
          (item) => item.patientId !== action.payload
        ),
        records: state.records.filter(
          (item) => item.patientId !== action.payload
        ),
        labTests: state.labTests.filter(
          (item) => item.patientId !== action.payload
        ),
        invoices: state.invoices.filter(
          (item) => item.patientId !== action.payload
        ),
        beds: freeBedsForPatient(state.beds, action.payload),
      };
    case "ADD_STAFF":
      return { ...state, staff: [action.payload, ...state.staff] };
    case "UPDATE_STAFF":
      return { ...state, staff: replaceById(state.staff, action.payload) };
    case "DELETE_STAFF": {
      const remaining = state.staff.filter((item) => item.id !== action.payload);
      return {
        ...state,
        staff: remaining,
        departments: state.departments.map((department) =>
          department.headStaffId === action.payload
            ? {
                ...department,
                headStaffId:
                  remaining.find(
                    (member) =>
                      member.role === "Doctor" &&
                      member.departmentId === department.id
                  )?.id ?? "",
              }
            : department
        ),
        appointments: state.appointments.filter(
          (item) => item.doctorId !== action.payload
        ),
        records: state.records.filter(
          (item) => item.doctorId !== action.payload
        ),
        labTests: state.labTests.filter(
          (item) => item.doctorId !== action.payload
        ),
      };
    }
    case "ADD_DEPARTMENT":
      return {
        ...state,
        departments: [...state.departments, action.payload],
      };
    case "UPDATE_DEPARTMENT":
      return {
        ...state,
        departments: replaceById(state.departments, action.payload),
      };
    case "DELETE_DEPARTMENT": {
      const remaining = state.departments.filter(
        (item) => item.id !== action.payload
      );
      const fallback =
        remaining.find((item) => item.id === "D08") ?? remaining[0];
      if (!fallback) return { ...state, departments: [] };
      return {
        ...state,
        departments: remaining,
        staff: state.staff.map((member) =>
          member.departmentId === action.payload
            ? { ...member, departmentId: fallback.id }
            : member
        ),
        appointments: state.appointments.map((appointment) =>
          appointment.departmentId === action.payload
            ? { ...appointment, departmentId: fallback.id }
            : appointment
        ),
      };
    }
    case "ADD_APPOINTMENT":
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
      };
    case "UPDATE_APPOINTMENT":
      return {
        ...state,
        appointments: replaceById(state.appointments, action.payload),
      };
    case "DELETE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.filter(
          (item) => item.id !== action.payload
        ),
      };
    case "ADD_RECORD":
      return { ...state, records: [action.payload, ...state.records] };
    case "UPDATE_RECORD":
      return { ...state, records: replaceById(state.records, action.payload) };
    case "DELETE_RECORD":
      return {
        ...state,
        records: state.records.filter((item) => item.id !== action.payload),
      };
    case "ADD_WARD":
      return { ...state, wards: [...state.wards, action.payload] };
    case "UPDATE_WARD":
      return { ...state, wards: replaceById(state.wards, action.payload) };
    case "DELETE_WARD": {
      const occupied = state.beds.filter(
        (bed) => bed.wardId === action.payload && bed.patientId
      );
      const patientIds = occupied
        .map((bed) => bed.patientId)
        .filter((value): value is string => Boolean(value));
      return {
        ...state,
        wards: state.wards.filter((item) => item.id !== action.payload),
        beds: state.beds.filter((bed) => bed.wardId !== action.payload),
        patients: state.patients.map((patient) =>
          patientIds.includes(patient.id)
            ? { ...patient, status: "Outpatient" }
            : patient
        ),
      };
    }
    case "UPDATE_BED":
      return { ...state, beds: replaceById(state.beds, action.payload) };
    case "ADD_LAB_TEST":
      return { ...state, labTests: [action.payload, ...state.labTests] };
    case "UPDATE_LAB_TEST":
      return {
        ...state,
        labTests: replaceById(state.labTests, action.payload),
      };
    case "DELETE_LAB_TEST":
      return {
        ...state,
        labTests: state.labTests.filter(
          (item) => item.id !== action.payload
        ),
      };
    case "ADD_MEDICINE":
      return { ...state, medicines: [action.payload, ...state.medicines] };
    case "UPDATE_MEDICINE":
      return {
        ...state,
        medicines: replaceById(state.medicines, action.payload),
      };
    case "DELETE_MEDICINE":
      return {
        ...state,
        medicines: state.medicines.filter(
          (item) => item.id !== action.payload
        ),
      };
    case "RESTOCK_MEDICINE":
      return {
        ...state,
        medicines: state.medicines.map((medicine) =>
          medicine.id === action.payload.id
            ? {
                ...medicine,
                stock: medicine.stock + action.payload.quantity,
              }
            : medicine
        ),
      };
    case "ADD_INVOICE":
      return { ...state, invoices: [action.payload, ...state.invoices] };
    case "UPDATE_INVOICE":
      return {
        ...state,
        invoices: replaceById(state.invoices, action.payload),
      };
    case "DELETE_INVOICE":
      return {
        ...state,
        invoices: state.invoices.filter(
          (item) => item.id !== action.payload
        ),
      };
    case "RECORD_PAYMENT": {
      return {
        ...state,
        invoices: state.invoices.map((invoice) => {
          if (invoice.id !== action.payload.id) return invoice;
          const paid = Math.min(
            invoice.total,
            roundMoney(invoice.paid + action.payload.amount)
          );
          const updated: Invoice = {
            ...invoice,
            paid,
            paymentMethod: action.payload.paymentMethod,
          };
          return { ...updated, status: recalcInvoiceStatus(updated) };
        }),
      };
    }
    case "ADMIT_PATIENT":
      return {
        ...state,
        patients: state.patients.map((patient) =>
          patient.id === action.payload.patientId
            ? { ...patient, status: "Admitted" }
            : patient
        ),
        beds: state.beds.map((bed) => {
          if (bed.id === action.payload.bedId) {
            return {
              ...bed,
              status: "Occupied",
              patientId: action.payload.patientId,
              admittedAt: action.payload.admittedAt,
            };
          }
          if (bed.patientId === action.payload.patientId) {
            return {
              ...bed,
              status: "Available",
              patientId: undefined,
              admittedAt: undefined,
            };
          }
          return bed;
        }),
      };
    case "TRANSFER_PATIENT": {
      const freed = freeBedsForPatient(state.beds, action.payload.patientId);
      return {
        ...state,
        beds: freed.map((bed) =>
          bed.id === action.payload.toBedId
            ? {
                ...bed,
                status: "Occupied",
                patientId: action.payload.patientId,
                admittedAt: action.payload.admittedAt,
              }
            : bed
        ),
      };
    }
    case "DISCHARGE_PATIENT":
      return {
        ...state,
        patients: state.patients.map((patient) =>
          patient.id === action.payload.patientId
            ? { ...patient, status: "Discharged" }
            : patient
        ),
        beds: freeBedsForPatient(state.beds, action.payload.patientId),
      };
    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    default:
      return state;
  }
}
