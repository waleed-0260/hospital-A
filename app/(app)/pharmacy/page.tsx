"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  Package,
  PackagePlus,
  Pencil,
  Pill,
  Plus,
  Trash2,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MedicineForm } from "@/components/forms/MedicineForm";
import { RestockForm } from "@/components/forms/RestockForm";
import {
  EXPIRY_WINDOW_DAYS,
  MEDICINE_CATEGORIES,
  PAGE_SIZE,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { matchesQuery, paginate } from "@/lib/utils";
import type { Medicine } from "@/types";

const STOCK_TABS = [
  { value: "All", label: "All" },
  { value: "Low stock", label: "Low stock" },
  { value: "Out of stock", label: "Out of stock" },
  { value: "Expiring", label: "Expiring soon" },
] as const;

export default function PharmacyPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState("All");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Medicine | null>(null);

  const today = new Date();
  const restockMedicine = state.medicines.find(
    (medicine) => medicine.id === restockId
  );

  const expiryDays = (medicine: Medicine) =>
    differenceInCalendarDays(parseISO(medicine.expiryDate), today);

  const isLow = (medicine: Medicine) =>
    medicine.stock > 0 && medicine.stock <= medicine.reorderLevel;
  const isOut = (medicine: Medicine) => medicine.stock === 0;

  const stats = useMemo(() => {
    const inventoryValue = state.medicines.reduce(
      (sum, medicine) => sum + medicine.stock * medicine.unitPrice,
      0
    );
    return {
      total: state.medicines.length,
      low: state.medicines.filter(isLow).length,
      out: state.medicines.filter(isOut).length,
      expiring: state.medicines.filter(
        (medicine) =>
          differenceInCalendarDays(parseISO(medicine.expiryDate), today) <=
          EXPIRY_WINDOW_DAYS
      ).length,
      value: inventoryValue,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.medicines]);

  const tabs = STOCK_TABS.map((item) => ({
    ...item,
    count:
      item.value === "Low stock"
        ? state.medicines.filter(isLow).length
        : item.value === "Out of stock"
          ? state.medicines.filter(isOut).length
          : item.value === "Expiring"
            ? state.medicines.filter(
                (medicine) =>
                  differenceInCalendarDays(
                    parseISO(medicine.expiryDate),
                    today
                  ) <= EXPIRY_WINDOW_DAYS
              ).length
            : state.medicines.length,
  }));

  const filtered = useMemo(() => {
    return state.medicines.filter((medicine) => {
      if (category !== "All" && medicine.category !== category) return false;
      if (tab === "Low stock" && !isLow(medicine)) return false;
      if (tab === "Out of stock" && !isOut(medicine)) return false;
      if (
        tab === "Expiring" &&
        expiryDays(medicine) > EXPIRY_WINDOW_DAYS
      )
        return false;
      return matchesQuery(query, [
        medicine.name,
        medicine.genericName,
        medicine.manufacturer,
        medicine.category,
        medicine.id,
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.medicines, query, category, tab]);

  const rows = paginate(filtered, page, PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (medicine: Medicine) => {
    setEditing(medicine);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: "DELETE_MEDICINE", payload: pendingDelete.id });
    toast({
      title: "Medicine removed",
      description: `${pendingDelete.name} was removed from inventory.`,
    });
    setPendingDelete(null);
    setPage(1);
  };

  const columns: TableColumn<Medicine>[] = [
    {
      key: "name",
      header: "Medicine",
      sortable: true,
      sortValue: (medicine) => medicine.name,
      render: (medicine) => (
        <span className="block max-w-[220px]">
          <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {medicine.name}
          </span>
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
            {medicine.genericName} · {medicine.manufacturer}
          </span>
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (medicine) => (
        <Badge tone="blue">{medicine.category}</Badge>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      sortValue: (medicine) => medicine.stock,
      render: (medicine) => (
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {medicine.stock}
          </span>
          {isOut(medicine) ? (
            <Badge tone="red">Out</Badge>
          ) : isLow(medicine) ? (
            <Badge tone="amber">Low</Badge>
          ) : (
            <Badge tone="green">OK</Badge>
          )}
        </span>
      ),
    },
    {
      key: "reorder",
      header: "Reorder at",
      render: (medicine) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {medicine.reorderLevel}
        </span>
      ),
    },
    {
      key: "price",
      header: "Unit price",
      sortable: true,
      sortValue: (medicine) => medicine.unitPrice,
      render: (medicine) => (
        <span className="text-sm font-medium">
          {formatCurrency(medicine.unitPrice)}
        </span>
      ),
    },
    {
      key: "expiry",
      header: "Expiry",
      sortable: true,
      sortValue: (medicine) => medicine.expiryDate,
      render: (medicine) => {
        const days = expiryDays(medicine);
        return (
          <span className="flex flex-col items-start gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(medicine.expiryDate)}
            </span>
            {days < 0 ? (
              <Badge tone="red">Expired</Badge>
            ) : days <= EXPIRY_WINDOW_DAYS ? (
              <Badge tone="amber">{days}d left</Badge>
            ) : null}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (medicine) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Restock ${medicine.name}`}
            onClick={() => setRestockId(medicine.id)}
          >
            <PackagePlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${medicine.name}`}
            onClick={() => openEdit(medicine)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${medicine.name}`}
            onClick={() => setPendingDelete(medicine)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pharmacy"
        description="Manage medicine inventory, stock levels, restocking, and expiry dates."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Add medicine
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Medicines",
            value: stats.total,
            icon: <Pill className="h-5 w-5" />,
            tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300",
          },
          {
            label: "Low stock",
            value: stats.low,
            icon: <AlertTriangle className="h-5 w-5" />,
            tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
          },
          {
            label: "Out of stock",
            value: stats.out,
            icon: <Package className="h-5 w-5" />,
            tone: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300",
          },
          {
            label: "Expiring soon",
            value: stats.expiring,
            icon: <CalendarClock className="h-5 w-5" />,
            tone: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300",
          },
          {
            label: "Inventory value",
            value: formatCurrency(stats.value),
            icon: <CircleDollarSign className="h-5 w-5" />,
            tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
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
              placeholder="Search medicine, generic, manufacturer…"
              className="sm:max-w-sm"
            />
            <div className="flex items-center gap-2">
              <Select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                aria-label="Filter by category"
                className="w-44"
              >
                <option value="All">All categories</option>
                {MEDICINE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {filtered.length} item{filtered.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <Tabs
            tabs={tabs}
            value={tab}
            onChange={(value) => {
              setTab(value);
              setPage(1);
            }}
          />
        </div>

        <Table
          columns={columns}
          data={rows}
          getRowKey={(medicine) => medicine.id}
          emptyTitle="No medicines found"
          emptyDescription="Add inventory or adjust the filters."
          emptyAction={
            <Button size="sm" onClick={openCreate}>
              Add medicine
            </Button>
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
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit medicine" : "Add medicine"}
        description={
          editing
            ? "Update medicine details, stock thresholds, or pricing."
            : "Add a new medicine to the pharmacy inventory."
        }
      >
        <MedicineForm
          medicine={editing ?? undefined}
          onDone={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <Modal
        open={Boolean(restockMedicine)}
        onClose={() => setRestockId(null)}
        title="Restock medicine"
        size="sm"
      >
        {restockMedicine ? (
          <RestockForm
            medicine={restockMedicine}
            onDone={() => setRestockId(null)}
            onCancel={() => setRestockId(null)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete medicine?"
        description={
          pendingDelete
            ? `This will permanently remove ${pendingDelete.name} from the pharmacy inventory.`
            : ""
        }
        confirmLabel="Delete medicine"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
