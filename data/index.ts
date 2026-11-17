import { createAppointments } from "./appointments";
import { createInvoices } from "./billing";
import { createDepartments } from "./departments";
import { createLabTests } from "./laboratory";
import { createPatients } from "./patients";
import { createMedicines } from "./pharmacy";
import { createRecords } from "./records";
import { defaultSettings } from "./settings";
import { createStaff } from "./staff";
import { createWards } from "./wards";
import type { HospitalData } from "@/types";

export function createEmptyData(): HospitalData {
  return {
    patients: [],
    staff: [],
    departments: [],
    appointments: [],
    records: [],
    wards: [],
    beds: [],
    labTests: [],
    medicines: [],
    invoices: [],
    settings: defaultSettings(),
  };
}

export function createInitialData(): HospitalData {
  const patients = createPatients();
  const staff = createStaff();
  const departments = createDepartments(staff);
  const appointments = createAppointments(patients, staff);
  const records = createRecords(patients, staff);
  const { wards, beds } = createWards(patients);
  const labTests = createLabTests(patients, staff);
  const medicines = createMedicines();
  const invoices = createInvoices(patients);
  const settings = defaultSettings();

  return {
    patients,
    staff,
    departments,
    appointments,
    records,
    wards,
    beds,
    labTests,
    medicines,
    invoices,
    settings,
  };
}
