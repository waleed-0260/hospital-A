"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FlaskConical,
  FlaskConicalIcon,
  Play,
  Plus,
  Trash2,
  TriangleAlert,
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
import { LabOrderForm } from "@/components/forms/LabOrderForm";
import { LabResultForm } from "@/components/forms/LabResultForm";
import {
  LAB_PRIORITIES,
  LAB_STATUSES,
  PAGE_SIZE,
  statusTone,
} from "@/lib/constants";
import { formatCurrency, formatDate, formatDateTime, fullName } from "@/lib/format";
import { matchesQuery, paginate } from "@/lib/utils";
import type { LabTest } from "@/types";

export default function LaboratoryPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [page, setPage] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<LabTest | null>(null);

  const detailTest = state.labTests.find((test) => test.id === detailId);
  const resultTest = state.labTests.find((test) => test.id === resultId);

  const patientName = (id: string) => {
    const patient = state.patients.find((item) => item.id === id);
    return patient ? fullName(patient) : "Unknown patient";
  };
  const doctorName = (id: string) => {
    const doctor = state.staff.find((item) => item.id === id);
    return doctor ? `Dr. ${fullName(doctor)}` : "Unassigned";
  };

  const stats = useMemo(() => {
    return {
      total: state.labTests.length,
      pending: state.labTests.filter((test) => test.status === "Pending").length,
      inProgress: state.labTests.filter(
        (test) => test.status === "In Progress"
      ).length,
      completed: state.labTests.filter(
        (test) => test.status === "Completed"
      ).length,
      urgent: state.labTests.filter(
        (test) => test.priority === "Urgent" && test.status !== "Completed"
      ).length,
    };
  }, [state.labTests]);

  const statusTabs = useMemo(
    () => [
      { value: "All", label: "All", count: state.labTests.length },
      ...LAB_STATUSES.map((item) => ({
        value: item,
        label: item,
        count: state.labTests.filter((test) => test.status === item).length,
      })),
    ],
    [state.labTests]
  );

  const filtered = useMemo(() => {
    const items = state.labTests.filter((test) => {
      if (status !== "All" && test.status !== status) return false;
      if (priority !== "All" && test.priority !== priority) return false;
      return matchesQuery(query, [
        patientName(test.patientId),
        doctorName(test.doctorId),
        test.testName,
        test.category,
      ]);
    });
    return [...items].sort(
      (left, right) =>
        new Date(right.orderedAt).getTime() - new Date(left.orderedAt).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, query, status, priority]);

  const rows = paginate(filtered, page, PAGE_SIZE);

  const startTest = (test: LabTest) => {
    dispatch({
      type: "UPDATE_LAB_TEST",
      payload: { ...test, status: "In Progress" },
    });
    toast({
      title: "Test started",
      description: `${test.testName} is now in progress.`,
    });
  };

  const columns: TableColumn<LabTest>[] = [
    {
      key: "test",
      header: "Test",
      sortable: true,
      sortValue: (test) => test.testName,
      render: (test) => (
        <span className="block max-w-[220px]">
          <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {test.testName}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {test.category} · {test.id}
          </span>
        </span>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (test) => (
        <Link
          href={`/patients/${test.patientId}`}
          className="text-sm font-medium text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
        >
          {patientName(test.patientId)}
        </Link>
      ),
    },
    {
      key: "doctor",
      header: "Ordered by",
      render: (test) => (
        <span className="text-sm">{doctorName(test.doctorId)}</span>
      ),
    },
    {
      key: "ordered",
      header: "Ordered",
      sortable: true,
      sortValue: (test) => test.orderedAt,
      render: (test) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(test.orderedAt)}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (test) => (
        <Badge tone={statusTone(test.priority)}>{test.priority}</Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      sortValue: (test) => test.price,
      render: (test) => (
        <span className="text-sm font-medium">
          {formatCurrency(test.price)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (test) => (
        <Badge tone={statusTone(test.status)} dot>
          {test.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (test) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="View test"
            onClick={() => setDetailId(test.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {test.status === "Completed" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="View result"
              onClick={() => setDetailId(test.id)}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Enter result"
              onClick={() => setResultId(test.id)}
            >
              <FlaskConical className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete test"
            onClick={() => setPendingDelete(test)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: "DELETE_LAB_TEST", payload: pendingDelete.id });
    toast({
      title: "Lab test deleted",
      description: `${pendingDelete.testName} was removed.`,
    });
    setPendingDelete(null);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Laboratory"
        description="Order tests, track progress, and publish results for patients."
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setOrderOpen(true)}
          >
            Order test
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Total tests",
            value: stats.total,
            icon: <FlaskConicalIcon className="h-5 w-5" />,
            tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: <Clock3 className="h-5 w-5" />,
            tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
          },
          {
            label: "In progress",
            value: stats.inProgress,
            icon: <Play className="h-5 w-5" />,
            tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: <CheckCircle2 className="h-5 w-5" />,
            tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
          },
          {
            label: "Urgent pending",
            value: stats.urgent,
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
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
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
              placeholder="Search test, patient, doctor…"
              className="sm:max-w-sm"
            />
            <div className="flex items-center gap-2">
              <Select
                value={priority}
                onChange={(event) => {
                  setPriority(event.target.value);
                  setPage(1);
                }}
                aria-label="Filter by priority"
                className="w-36"
              >
                <option value="All">All priorities</option>
                {LAB_PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </span>
            </div>
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
          getRowKey={(test) => test.id}
          emptyTitle="No lab tests found"
          emptyDescription="Order a new test or adjust the filters."
          emptyAction={
            <Button size="sm" onClick={() => setOrderOpen(true)}>
              Order test
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
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        title="Order lab test"
        description="Select a patient, doctor, and test from the catalog."
      >
        <LabOrderForm
          onDone={() => setOrderOpen(false)}
          onCancel={() => setOrderOpen(false)}
        />
      </Modal>

      <Modal
        open={Boolean(detailTest)}
        onClose={() => setDetailId(null)}
        title={detailTest?.testName ?? "Lab test"}
        description={detailTest ? `${detailTest.category} · ${detailTest.id}` : undefined}
      >
        {detailTest ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(detailTest.status)} dot>
                {detailTest.status}
              </Badge>
              <Badge tone={statusTone(detailTest.priority)}>
                {detailTest.priority}
              </Badge>
              <Badge tone="slate">{formatCurrency(detailTest.price)}</Badge>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  Patient
                </dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {patientName(detailTest.patientId)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  Ordered by
                </dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {doctorName(detailTest.doctorId)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  Ordered at
                </dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDateTime(detailTest.orderedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  Result date
                </dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {detailTest.resultDate
                    ? formatDate(detailTest.resultDate)
                    : "Awaiting result"}
                </dd>
              </div>
            </dl>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Result
              </p>
              <p className="mt-1 whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                {detailTest.result ?? "No result has been entered yet."}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {detailTest.status === "Pending" ? (
                <Button
                  variant="secondary"
                  icon={<Play className="h-4 w-4" />}
                  onClick={() => startTest(detailTest)}
                >
                  Mark in progress
                </Button>
              ) : null}
              {detailTest.status !== "Completed" ? (
                <Button
                  icon={<FlaskConical className="h-4 w-4" />}
                  onClick={() => {
                    setResultId(detailTest.id);
                    setDetailId(null);
                  }}
                >
                  Enter result
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(resultTest)}
        onClose={() => setResultId(null)}
        title="Enter lab result"
        description={resultTest ? resultTest.testName : undefined}
      >
        {resultTest ? (
          <LabResultForm
            test={resultTest}
            onDone={() => setResultId(null)}
            onCancel={() => setResultId(null)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete lab test?"
        description={
          pendingDelete
            ? `This will permanently remove ${pendingDelete.testName} for ${patientName(pendingDelete.patientId)}.`
            : ""
        }
        confirmLabel="Delete test"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
