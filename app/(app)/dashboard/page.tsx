"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarCheck2,
  CalendarPlus,
  ChevronRight,
  DollarSign,
  FlaskConical,
  Pill,
  UserPlus,
  Users,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdmissionsChart } from "@/components/charts/AdmissionsChart";
import { DepartmentChart } from "@/components/charts/DepartmentChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { calcAge, formatCurrency, formatDate, fullName } from "@/lib/format";
import { statusTone } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { state } = useHospital();
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const admitted = state.patients.filter(
    (patient) => patient.status === "Admitted"
  ).length;
  const todaysAppointments = state.appointments.filter(
    (appointment) => appointment.date === todayKey
  );
  const pendingLabs = state.labTests.filter(
    (test) => test.status !== "Completed"
  ).length;
  const lowStock = state.medicines.filter(
    (medicine) => medicine.stock <= medicine.reorderLevel
  );
  const collected = state.invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  const outstanding = state.invoices.reduce(
    (sum, invoice) => sum + Math.max(0, invoice.total - invoice.paid),
    0
  );
  const stats = {
    admitted,
    todaysAppointments,
    pendingLabs,
    lowStock,
    collected,
    outstanding,
  };

  const appointmentsTrend = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return {
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        admissions: state.appointments.filter(
          (appointment) =>
            appointment.date === key && appointment.status !== "Cancelled"
        ).length,
      };
    });
  }, [state.appointments]);

  const departmentData = useMemo(() => {
    return state.departments
      .map((department) => ({
        name: department.name,
        value: state.appointments.filter(
          (appointment) => appointment.departmentId === department.id
        ).length,
      }))
      .filter((item) => item.value > 0);
  }, [state.departments, state.appointments]);

  const revenueTrend = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return {
        label: date.toLocaleDateString("en-US", { month: "short" }),
        revenue: state.invoices
          .filter((invoice) => invoice.date.slice(0, 7) === key)
          .reduce((sum, invoice) => sum + invoice.paid, 0),
      };
    });
  }, [state.invoices]);

  const todaysSchedule = [...stats.todaysAppointments]
    .sort((left, right) => left.time.localeCompare(right.time))
    .slice(0, 6);

  const recentPatients = [...state.patients]
    .sort(
      (left, right) =>
        new Date(right.registeredAt).getTime() -
        new Date(left.registeredAt).getTime()
    )
    .slice(0, 5);

  const wardOccupancy = state.wards.map((ward) => {
    const beds = state.beds.filter((bed) => bed.wardId === ward.id);
    const occupied = beds.filter((bed) => bed.status === "Occupied").length;
    return {
      ...ward,
      total: beds.length,
      occupied,
      percent: beds.length ? Math.round((occupied / beds.length) * 100) : 0,
    };
  });

  const doctorName = (id: string) => {
    const doctor = state.staff.find((member) => member.id === id);
    return doctor ? `Dr. ${fullName(doctor)}` : "Unassigned";
  };

  const patientName = (id: string) => {
    const patient = state.patients.find((item) => item.id === id);
    return patient ? fullName(patient) : "Unknown patient";
  };

  const departmentName = (id: string) =>
    state.departments.find((department) => department.id === id)?.name ??
    "General";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`${state.settings.name} · Overview for ${formatDate(today)}`}
        actions={
          <>
            <button
              type="button"
              onClick={() => router.push("/patients/new")}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <UserPlus className="h-4 w-4" />
              Register patient
            </button>
            <button
              type="button"
              onClick={() => router.push("/appointments/new")}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              <CalendarPlus className="h-4 w-4" />
              New appointment
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total patients"
          value={state.patients.length}
          icon={<Users className="h-5 w-5" />}
          hint={`${stats.admitted} currently admitted`}
          accent="teal"
        />
        <StatCard
          label="Today's appointments"
          value={stats.todaysAppointments.length}
          icon={<CalendarCheck2 className="h-5 w-5" />}
          hint={`${stats.todaysAppointments.filter((a) => a.status === "Scheduled").length} still scheduled`}
          accent="blue"
        />
        <StatCard
          label="Pending lab tests"
          value={stats.pendingLabs}
          icon={<FlaskConical className="h-5 w-5" />}
          hint={`${state.labTests.length} total tests ordered`}
          accent="amber"
        />
        <StatCard
          label="Revenue collected"
          value={formatCurrency(stats.collected)}
          icon={<DollarSign className="h-5 w-5" />}
          hint={`${formatCurrency(stats.outstanding)} outstanding`}
          accent="emerald"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Patient flow</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Appointments booked over the last 7 days
              </p>
            </div>
            <Badge tone="teal" dot>
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            <AdmissionsChart data={appointmentsTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Appointments by department</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Distribution across departments
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {departmentData.length === 0 ? (
              <EmptyState
                title="No appointments yet"
                description="Schedule appointments to see the department split."
                icon={<Activity className="h-6 w-6" />}
              />
            ) : (
              <DepartmentChart data={departmentData} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Today&apos;s schedule</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {stats.todaysAppointments.length} appointment
                {stats.todaysAppointments.length === 1 ? "" : "s"} on{" "}
                {formatDate(today)}
              </p>
            </div>
            <Link
              href="/appointments"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
            >
              View all
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          {todaysSchedule.length === 0 ? (
            <EmptyState
              title="No appointments today"
              description="The schedule is clear. Book a new appointment to get started."
              icon={<CalendarCheck2 className="h-6 w-6" />}
              action={
                <Link
                  href="/appointments/new"
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
                >
                  <CalendarPlus className="h-4 w-4" />
                  New appointment
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {todaysSchedule.map((appointment) => (
                <li key={appointment.id}>
                  <Link
                    href={`/appointments/${appointment.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="w-14 shrink-0 text-sm font-semibold text-slate-900 dark:text-white">
                      {appointment.time}
                    </span>
                    <Avatar name={patientName(appointment.patientId)} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {patientName(appointment.patientId)}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {doctorName(appointment.doctorId)} ·{" "}
                        {departmentName(appointment.departmentId)}
                      </span>
                    </span>
                    <Badge tone={statusTone(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Bed occupancy</CardTitle>
              <Link
                href="/wards"
                className="text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
              >
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {wardOccupancy.map((ward) => (
                <div key={ward.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {ward.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {ward.occupied}/{ward.total}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        ward.percent >= 80
                          ? "bg-red-500"
                          : ward.percent >= 50
                            ? "bg-amber-500"
                            : "bg-teal-500"
                      )}
                      style={{ width: `${ward.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attention needed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/pharmacy"
                className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3 transition hover:bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30"
              >
                <Pill className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                    {stats.lowStock.length} low stock medicine
                    {stats.lowStock.length === 1 ? "" : "s"}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    At or below reorder level
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/laboratory"
                className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 transition hover:bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30"
              >
                <FlaskConical className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                    {state.labTests.filter((test) => test.status === "Pending").length}{" "}
                    lab test
                    {state.labTests.filter((test) => test.status === "Pending")
                      .length === 1
                      ? ""
                      : "s"}{" "}
                    pending
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Awaiting processing
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/billing"
                className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/60 p-3 transition hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/30"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                    {
                      state.invoices.filter(
                        (invoice) => invoice.status === "Overdue"
                      ).length
                    }{" "}
                    overdue invoice
                    {state.invoices.filter(
                      (invoice) => invoice.status === "Overdue"
                    ).length === 1
                      ? ""
                      : "s"}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Follow up on outstanding balances
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Revenue</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Payments collected over the last 6 months
              </p>
            </div>
            <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
              {formatCurrency(stats.collected)} total
            </span>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent patients</CardTitle>
            <Link
              href="/patients"
              className="text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
            >
              View all
            </Link>
          </CardHeader>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPatients.map((patient) => (
              <li key={patient.id}>
                <Link
                  href={`/patients/${patient.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <Avatar name={fullName(patient)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {fullName(patient)}
                    </span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {patient.mrn} · {calcAge(patient.dob)} yrs ·{" "}
                      {patient.gender}
                    </span>
                  </span>
                  <Badge tone={statusTone(patient.status)}>
                    {patient.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
