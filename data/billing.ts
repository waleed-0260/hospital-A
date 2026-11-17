import { addDays, format, subDays } from "date-fns";
import { PAYMENT_METHODS } from "@/lib/constants";
import { calcInvoiceTotal, roundMoney } from "@/lib/utils";
import { createRng, pick, randomInt } from "./random";
import type { Invoice, InvoiceItem, Patient } from "@/types";

const services: Array<{ description: string; unitPrice: number }> = [
  { description: "General Consultation", unitPrice: 80 },
  { description: "Specialist Consultation", unitPrice: 150 },
  { description: "Emergency Visit", unitPrice: 250 },
  { description: "Follow-up Consultation", unitPrice: 60 },
  { description: "Complete Blood Count", unitPrice: 45 },
  { description: "Basic Metabolic Panel", unitPrice: 60 },
  { description: "Lipid Profile", unitPrice: 55 },
  { description: "Chest X-Ray", unitPrice: 120 },
  { description: "MRI Brain", unitPrice: 650 },
  { description: "CT Abdomen", unitPrice: 420 },
  { description: "ECG", unitPrice: 50 },
  { description: "Physiotherapy Session", unitPrice: 90 },
  { description: "Wound Dressing", unitPrice: 40 },
  { description: "IV Fluids", unitPrice: 35 },
  { description: "Inpatient Room Charge", unitPrice: 300 },
  { description: "ICU Room Charge", unitPrice: 900 },
  { description: "Medication Dispensing", unitPrice: 75 },
  { description: "Vaccination", unitPrice: 45 },
  { description: "Ultrasound Scan", unitPrice: 180 },
  { description: "Minor Procedure", unitPrice: 350 },
];

export function createInvoices(patients: Patient[]): Invoice[] {
  const rng = createRng(889900);
  const invoices: Invoice[] = [];
  const year = new Date().getFullYear();

  for (let index = 0; index < 12; index += 1) {
    const patient = patients[(index * 5) % patients.length];
    const status =
      index < 5
        ? "Paid"
        : index < 8
          ? "Partial"
          : index < 10
            ? "Unpaid"
            : "Overdue";

    const itemCount = randomInt(rng, 1, 2);
    const items: InvoiceItem[] = [];
    const used = new Set<string>();
    while (items.length < itemCount) {
      const service = pick(rng, services);
      if (used.has(service.description)) continue;
      used.add(service.description);
      items.push({
        description: service.description,
        quantity: randomInt(rng, 1, 2),
        unitPrice: service.unitPrice,
      });
    }

    const discount = pick(rng, [0, 0, 5, 10]);
    const tax = pick(rng, [5, 8, 10]);
    const total = calcInvoiceTotal(items, discount, tax);

    let date: Date;
    let dueDate: Date;
    if (status === "Overdue") {
      date = subDays(new Date(), randomInt(rng, 60, 150));
      dueDate = addDays(date, 14);
    } else if (status === "Unpaid") {
      date = subDays(new Date(), randomInt(rng, 0, 10));
      dueDate = addDays(date, 30);
    } else {
      date = subDays(new Date(), randomInt(rng, 1, 120));
      dueDate = addDays(date, 14);
    }

    let paid = 0;
    let paymentMethod: Invoice["paymentMethod"];
    if (status === "Paid") {
      paid = total;
      paymentMethod = pick(rng, PAYMENT_METHODS);
    } else if (status === "Partial") {
      paid = roundMoney(total * (randomInt(rng, 30, 75) / 100));
      paymentMethod = pick(rng, PAYMENT_METHODS);
    }

    invoices.push({
      id: `I${String(index + 1).padStart(3, "0")}`,
      invoiceNo: `INV-${year}-${String(index + 1).padStart(4, "0")}`,
      patientId: patient.id,
      date: format(date, "yyyy-MM-dd"),
      dueDate: format(dueDate, "yyyy-MM-dd"),
      items,
      discount,
      tax,
      total,
      paid,
      status,
      paymentMethod,
    });
  }

  return invoices.sort((a, b) => b.date.localeCompare(a.date));
}
