"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Banknote,
  CircleDollarSign,
  Eye,
  Plus,
  ReceiptText,
  Trash2,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Tabs } from "@/components/ui/Tabs";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PaymentForm } from "@/components/forms/PaymentForm";
import {
  INVOICE_STATUSES,
  PAGE_SIZE,
  statusTone,
} from "@/lib/constants";
import { formatCurrency, formatDate, fullName } from "@/lib/format";
import { matchesQuery, paginate } from "@/lib/utils";
import type { Invoice } from "@/types";

export default function BillingPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);

  const paymentInvoice = state.invoices.find(
    (invoice) => invoice.id === paymentId
  );

  const patientName = (id: string) => {
    const patient = state.patients.find((item) => item.id === id);
    return patient ? fullName(patient) : "Unknown patient";
  };

  const stats = useMemo(() => {
    const total = state.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paid = state.invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
    return {
      total,
      paid,
      outstanding: Math.max(0, total - paid),
      overdue: state.invoices.filter(
        (invoice) => invoice.status === "Overdue"
      ).length,
    };
  }, [state.invoices]);

  const statusTabs = useMemo(
    () => [
      { value: "All", label: "All", count: state.invoices.length },
      ...INVOICE_STATUSES.map((item) => ({
        value: item,
        label: item,
        count: state.invoices.filter((invoice) => invoice.status === item)
          .length,
      })),
    ],
    [state.invoices]
  );

  const filtered = useMemo(() => {
    const items = state.invoices.filter((invoice) => {
      if (status !== "All" && invoice.status !== status) return false;
      return matchesQuery(query, [
        invoice.invoiceNo,
        patientName(invoice.patientId),
        invoice.status,
      ]);
    });
    return [...items].sort(
      (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, query, status]);

  const rows = paginate(filtered, page, PAGE_SIZE);

  const columns: TableColumn<Invoice>[] = [
    {
      key: "invoiceNo",
      header: "Invoice",
      sortable: true,
      sortValue: (invoice) => invoice.invoiceNo,
      render: (invoice) => (
        <Link
          href={`/billing/${invoice.id}`}
          className="group block"
        >
          <span className="block font-medium text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">
            {invoice.invoiceNo}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {formatDate(invoice.date)}
          </span>
        </Link>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (invoice) => (
        <Link
          href={`/patients/${invoice.patientId}`}
          className="text-sm font-medium text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
        >
          {patientName(invoice.patientId)}
        </Link>
      ),
    },
    {
      key: "dueDate",
      header: "Due date",
      sortable: true,
      sortValue: (invoice) => invoice.dueDate,
      render: (invoice) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(invoice.dueDate)}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      sortValue: (invoice) => invoice.total,
      render: (invoice) => (
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrency(invoice.total)}
        </span>
      ),
    },
    {
      key: "paid",
      header: "Paid",
      sortable: true,
      sortValue: (invoice) => invoice.paid,
      render: (invoice) => (
        <span className="text-sm text-emerald-600 dark:text-emerald-400">
          {formatCurrency(invoice.paid)}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      sortable: true,
      sortValue: (invoice) => invoice.total - invoice.paid,
      render: (invoice) => (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {formatCurrency(Math.max(0, invoice.total - invoice.paid))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (invoice) => (
        <Badge tone={statusTone(invoice.status)} dot>
          {invoice.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (invoice) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/billing/${invoice.id}`}>
            <Button variant="ghost" size="icon" aria-label="View invoice">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Record payment"
            disabled={invoice.paid >= invoice.total}
            onClick={() => setPaymentId(invoice.id)}
          >
            <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete invoice"
            onClick={() => setPendingDelete(invoice)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: "DELETE_INVOICE", payload: pendingDelete.id });
    toast({
      title: "Invoice deleted",
      description: `${pendingDelete.invoiceNo} was removed from billing.`,
    });
    setPendingDelete(null);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Invoices, payments, outstanding balances, and revenue tracking."
        actions={
          <Link href="/billing/new">
            <Button icon={<Plus className="h-4 w-4" />}>New invoice</Button>
          </Link>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total billed",
            value: formatCurrency(stats.total),
            icon: <ReceiptText className="h-5 w-5" />,
            tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300",
          },
          {
            label: "Collected",
            value: formatCurrency(stats.paid),
            icon: <CircleDollarSign className="h-5 w-5" />,
            tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
          },
          {
            label: "Outstanding",
            value: formatCurrency(stats.outstanding),
            icon: <Wallet className="h-5 w-5" />,
            tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
          },
          {
            label: "Overdue invoices",
            value: stats.overdue,
            icon: <TriangleAlert className="h-5 w-5" />,
            tone: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300",
          },
        ].map((item) => (
          <Card key={item.label} className="flex items-center gap-3 p-4">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}
            >
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p className="truncate text-xl font-semibold text-slate-900 dark:text-white">
                {item.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="Search invoice number or patient…"
              className="sm:max-w-sm"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {filtered.length} invoice{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
          <Tabs
            tabs={statusTabs}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </div>

        <Table
          columns={columns}
          data={rows}
          getRowKey={(invoice) => invoice.id}
          emptyTitle="No invoices found"
          emptyDescription="Create a new invoice or adjust the filters."
          emptyAction={
            <Link href="/billing/new">
              <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                New invoice
              </Button>
            </Link>
          }
        />

        {filtered.length > 0 ? (
          <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </Card>

      <Modal
        open={Boolean(paymentInvoice)}
        onClose={() => setPaymentId(null)}
        title="Record payment"
        description={paymentInvoice?.invoiceNo}
        size="sm"
      >
        {paymentInvoice ? (
          <PaymentForm
            invoice={paymentInvoice}
            onDone={() => setPaymentId(null)}
            onCancel={() => setPaymentId(null)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete invoice?"
        description={
          pendingDelete
            ? `This will permanently remove ${pendingDelete.invoiceNo} for ${patientName(pendingDelete.patientId)}.`
            : ""
        }
        confirmLabel="Delete invoice"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
