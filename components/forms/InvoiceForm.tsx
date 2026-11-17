"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isBefore, parseISO, startOfDay } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "./FormSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { invoiceSchema, type InvoiceFormValues } from "@/lib/schemas";
import { PAYMENT_METHODS } from "@/lib/constants";
import {
  calcInvoiceTotal,
  invoiceSubtotal,
  makeId,
  makeInvoiceNo,
  roundMoney,
} from "@/lib/utils";
import { formatCurrency, fullName } from "@/lib/format";
import type { Invoice, InvoiceStatus } from "@/types";

export function InvoiceForm() {
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      patientId: state.patients[0]?.id ?? "",
      date: today,
      dueDate: today,
      items: [{ description: "", quantity: "1", unitPrice: "" }],
      discount: "0",
      tax: "5",
      paymentMethod: "Cash",
      paid: "0",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" }) ?? [];
  const discount = Number(useWatch({ control, name: "discount" })) || 0;
  const tax = Number(useWatch({ control, name: "tax" })) || 0;
  const paid = Number(useWatch({ control, name: "paid" })) || 0;

  const numericItems = watchedItems.map((item) => ({
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
  }));
  const subtotal = invoiceSubtotal(numericItems);
  const total = calcInvoiceTotal(numericItems, discount, tax);
  const balance = Math.max(0, roundMoney(total - paid));

  const onSubmit = async (values: InvoiceFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const items = values.items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));
    const discountValue = Number(values.discount) || 0;
    const taxValue = Number(values.tax) || 0;
    const invoiceTotal = calcInvoiceTotal(items, discountValue, taxValue);
    const paidValue = Math.min(Number(values.paid) || 0, invoiceTotal);
    let status: InvoiceStatus = "Unpaid";
    if (paidValue >= invoiceTotal) status = "Paid";
    else if (isBefore(parseISO(values.dueDate), startOfDay(new Date())))
      status = "Overdue";
    else if (paidValue > 0) status = "Partial";

    const payload: Invoice = {
      id: makeId("I", state.invoices.map((item) => item.id)),
      invoiceNo: makeInvoiceNo(state.invoices.map((item) => item.invoiceNo)),
      patientId: values.patientId,
      date: values.date,
      dueDate: values.dueDate,
      items,
      discount: discountValue,
      tax: taxValue,
      total: invoiceTotal,
      paid: paidValue,
      status,
      paymentMethod: paidValue > 0 ? values.paymentMethod : undefined,
    };

    dispatch({ type: "ADD_INVOICE", payload });
    toast({
      title: "Invoice created",
      description: `${payload.invoiceNo} has been added to billing.`,
    });
    router.push(`/billing/${payload.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-5">
          <FormSection title="Invoice details" description="Patient and billing dates.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Patient" htmlFor="patientId" error={errors.patientId?.message} required>
                <Select id="patientId" {...register("patientId")} invalid={Boolean(errors.patientId)}>
                  {state.patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {fullName(patient)} · {patient.mrn}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Payment method" htmlFor="paymentMethod" error={errors.paymentMethod?.message} required>
                <Select id="paymentMethod" {...register("paymentMethod")}>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Invoice date" htmlFor="date" error={errors.date?.message} required>
                <Input id="date" type="date" {...register("date")} invalid={Boolean(errors.date)} />
              </FormField>
              <FormField label="Due date" htmlFor="dueDate" error={errors.dueDate?.message} required>
                <Input id="dueDate" type="date" {...register("dueDate")} invalid={Boolean(errors.dueDate)} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Line items" description="Add services, procedures, and medications.">
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[1fr_100px_120px_auto] sm:items-start"
                >
                  <FormField
                    label="Description"
                    htmlFor={`item-${index}-description`}
                    error={errors.items?.[index]?.description?.message}
                    required
                  >
                    <Input
                      id={`item-${index}-description`}
                      placeholder="Service or item"
                      {...register(`items.${index}.description`)}
                      invalid={Boolean(errors.items?.[index]?.description)}
                    />
                  </FormField>
                  <FormField
                    label="Qty"
                    htmlFor={`item-${index}-quantity`}
                    error={errors.items?.[index]?.quantity?.message}
                    required
                  >
                    <Input
                      id={`item-${index}-quantity`}
                      type="number"
                      min={1}
                      {...register(`items.${index}.quantity`)}
                      invalid={Boolean(errors.items?.[index]?.quantity)}
                    />
                  </FormField>
                  <FormField
                    label="Unit price"
                    htmlFor={`item-${index}-unitPrice`}
                    error={errors.items?.[index]?.unitPrice?.message}
                    required
                  >
                    <Input
                      id={`item-${index}-unitPrice`}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      {...register(`items.${index}.unitPrice`)}
                      invalid={Boolean(errors.items?.[index]?.unitPrice)}
                    />
                  </FormField>
                  <div className="flex items-end sm:pt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove line item ${index + 1}`}
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {errors.items?.root?.message ? (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.items.root.message}
                </p>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() =>
                  append({ description: "", quantity: "1", unitPrice: "" })
                }
              >
                Add line item
              </Button>
            </div>
          </FormSection>
        </div>

        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Invoice summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <FormField label="Discount (%)" htmlFor="discount" error={errors.discount?.message} required>
              <Input id="discount" type="number" min={0} max={100} step="0.1" {...register("discount")} />
            </FormField>
            <FormField label="Tax (%)" htmlFor="tax" error={errors.tax?.message} required>
              <Input id="tax" type="number" min={0} max={100} step="0.1" {...register("tax")} />
            </FormField>
            <FormField label="Amount paid ($)" htmlFor="paid" error={errors.paid?.message} required>
              <Input id="paid" type="number" min={0} step="0.01" {...register("paid")} />
            </FormField>
            <dl className="space-y-2 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Discount</dt>
                <dd className="text-slate-700 dark:text-slate-200">
                  {discount}% ({formatCurrency(subtotal * (discount / 100))})
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Tax</dt>
                <dd className="text-slate-700 dark:text-slate-200">{tax}%</dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-base font-semibold dark:border-slate-800">
                <dt className="text-slate-900 dark:text-white">Total</dt>
                <dd className="text-teal-700 dark:text-teal-300">
                  {formatCurrency(total)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Balance</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {formatCurrency(balance)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Create invoice
        </Button>
      </div>
    </form>
  );
}
