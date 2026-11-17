"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Banknote,
  Printer,
  ReceiptText,
  Trash2,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { statusTone } from "@/lib/constants";
import {
  formatCurrency,
  formatDate,
  fullName,
  initials,
} from "@/lib/format";
import { invoiceSubtotal } from "@/lib/utils";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invoice = state.invoices.find((item) => item.id === params.id);

  if (!invoice) {
    return (
      <Card>
        <EmptyState
          title="Invoice not found"
          description="This invoice may have been deleted."
          icon={<ReceiptText className="h-6 w-6" />}
          action={
            <Link href="/billing">
              <Button size="sm">Back to billing</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const patient = state.patients.find(
    (item) => item.id === invoice.patientId
  );
  const subtotal = invoiceSubtotal(invoice.items);
  const discountAmount = subtotal * (invoice.discount / 100);
  const taxAmount = (subtotal - discountAmount) * (invoice.tax / 100);
  const balance = Math.max(0, invoice.total - invoice.paid);

  const handleDelete = () => {
    dispatch({ type: "DELETE_INVOICE", payload: invoice.id });
    toast({
      title: "Invoice deleted",
      description: `${invoice.invoiceNo} was removed from billing.`,
    });
    router.push("/billing");
  };

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNo}
        description={`${patient ? fullName(patient) : "Unknown patient"} · Issued ${formatDate(invoice.date)}`}
        actions={
          <div className="no-print flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={<Printer className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              icon={<Banknote className="h-4 w-4" />}
              onClick={() => setPaymentOpen(true)}
              disabled={balance <= 0}
            >
              Record payment
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete invoice"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="print-area lg:col-span-2">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {state.settings.name}
                </p>
                <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                  {state.settings.address}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {state.settings.phone} · {state.settings.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Invoice
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {invoice.invoiceNo}
                </p>
                <Badge tone={statusTone(invoice.status)} dot>
                  {invoice.status}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 py-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Billed to
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {patient ? fullName(patient) : "Unknown patient"}
                </p>
                {patient ? (
                  <>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {patient.mrn}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {patient.phone}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {patient.address}, {patient.city}
                    </p>
                  </>
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Invoice date
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {formatDate(invoice.date)}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Due date
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Payment method
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {invoice.paymentMethod ?? "Not set"}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Balance due
                </p>
                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-y border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="py-3 pr-4 font-semibold">Description</th>
                    <th className="px-4 py-3 text-right font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Unit price
                    </th>
                    <th className="py-3 pl-4 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoice.items.map((item, index) => (
                    <tr key={`${item.description}-${index}`}>
                      <td className="py-3 pr-4 text-slate-800 dark:text-slate-200">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 pl-4 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <dl className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Subtotal
                  </dt>
                  <dd className="text-slate-900 dark:text-slate-100">
                    {formatCurrency(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Discount ({invoice.discount}%)
                  </dt>
                  <dd className="text-slate-900 dark:text-slate-100">
                    −{formatCurrency(discountAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Tax ({invoice.tax}%)
                  </dt>
                  <dd className="text-slate-900 dark:text-slate-100">
                    {formatCurrency(taxAmount)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold dark:border-slate-800">
                  <dt className="text-slate-900 dark:text-white">Total</dt>
                  <dd className="text-teal-700 dark:text-teal-300">
                    {formatCurrency(invoice.total)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">Paid</dt>
                  <dd className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(invoice.paid)}
                  </dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt className="text-slate-900 dark:text-white">Balance</dt>
                  <dd className="text-red-600 dark:text-red-400">
                    {formatCurrency(balance)}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="mt-8 border-t border-slate-100 pt-4 text-center text-xs text-slate-400 dark:border-slate-800">
              Thank you for choosing {state.settings.name}. Please contact us at{" "}
              {state.settings.phone} for billing questions.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-5 no-print">
          <Card>
            <CardHeader>
              <CardTitle>Payment summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Status
                </span>
                <Badge tone={statusTone(invoice.status)} dot>
                  {invoice.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Total
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Paid
                </span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(invoice.paid)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Balance
                </span>
                <span className="text-base font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(balance)}
                </span>
              </div>
              <Button
                className="w-full"
                icon={<Banknote className="h-4 w-4" />}
                onClick={() => setPaymentOpen(true)}
                disabled={balance <= 0}
              >
                Record payment
              </Button>
            </CardContent>
          </Card>

          {patient ? (
            <Card>
              <CardHeader>
                <CardTitle>Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700 dark:bg-teal-900/60 dark:text-teal-300">
                    {initials(patient.firstName, patient.lastName)}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                    >
                      {fullName(patient)}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {patient.mrn} · {patient.phone}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/patients/${patient.id}`}
                  className="mt-4 inline-flex text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
                >
                  Open patient profile
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Record payment"
        description={invoice.invoiceNo}
        size="sm"
      >
        <PaymentForm
          invoice={invoice}
          onDone={() => setPaymentOpen(false)}
          onCancel={() => setPaymentOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete invoice?"
        description={`This will permanently remove ${invoice.invoiceNo} for ${patient ? fullName(patient) : "this patient"}.`}
        confirmLabel="Delete invoice"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
