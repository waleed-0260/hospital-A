"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  FlaskConical,
  Menu,
  Moon,
  Pill,
  Plus,
  ReceiptText,
  Search,
  Sun,
  UserPlus,
} from "lucide-react";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";
import { Avatar } from "@/components/ui/Avatar";
import { useHospital } from "@/context/HospitalProvider";
import { APP_NAME } from "@/lib/constants";
import { matchesQuery } from "@/lib/utils";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Patients",
  appointments: "Appointments",
  records: "Medical Records",
  staff: "Staff",
  departments: "Departments",
  wards: "Wards & Beds",
  laboratory: "Laboratory",
  pharmacy: "Pharmacy",
  billing: "Billing",
  settings: "Settings",
};

function useClickOutside<T extends HTMLDivElement>(
  open: boolean,
  onClose: () => void
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open, onClose]);
  return ref;
}

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const { state, dispatch } = useHospital();
  const [query, setQuery] = useState("");
  type MenuKey = "search" | "quick" | "notifications";
  const [menu, setMenu] = useState<{ path: string; open: MenuKey[] }>({
    path: pathname,
    open: [],
  });

  const openMenus = menu.path === pathname ? menu.open : [];
  const setMenuOpen = (key: MenuKey, open: boolean) => {
    setMenu({
      path: pathname,
      open: open
        ? openMenus.includes(key)
          ? openMenus
          : [...openMenus, key]
        : openMenus.filter((item) => item !== key),
    });
  };
  const searchOpen = openMenus.includes("search");
  const quickOpen = openMenus.includes("quick");
  const notificationsOpen = openMenus.includes("notifications");

  const searchRef = useClickOutside<HTMLDivElement>(searchOpen, () =>
    setMenuOpen("search", false)
  );
  const quickRef = useClickOutside<HTMLDivElement>(quickOpen, () =>
    setMenuOpen("quick", false)
  );
  const notificationsRef = useClickOutside<HTMLDivElement>(
    notificationsOpen,
    () => setMenuOpen("notifications", false)
  );

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems: BreadcrumbItem[] = segments.map((segment, index) => ({
    label:
      routeLabels[segment] ??
      (segment === "new"
        ? "New"
        : segment === "edit"
          ? "Edit"
          : segment.toUpperCase()),
    href:
      index < segments.length - 1
        ? `/${segments.slice(0, index + 1).join("/")}`
        : undefined,
  }));

  const title = routeLabels[segments[0] ?? "dashboard"] ?? APP_NAME;
  const results = query.trim()
    ? state.patients.filter((patient) =>
        matchesQuery(query, [fullName(patient), patient.mrn])
      )
    : [];

  const today = format(new Date(), "yyyy-MM-dd");
  const todaysAppointments = state.appointments.filter(
    (appointment) =>
      appointment.date === today && appointment.status === "Scheduled"
  );
  const pendingLabs = state.labTests.filter((test) => test.status === "Pending");
  const lowStock = state.medicines.filter(
    (medicine) => medicine.stock <= medicine.reorderLevel
  );
  const notificationCount =
    todaysAppointments.length + pendingLabs.length + lowStock.length;
  const isDark = state.settings.theme === "dark";

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:hidden">
          {title}
        </p>
        <div className="hidden sm:block">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div ref={searchRef} className="relative hidden sm:block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setMenuOpen("search", true);
            }}
            onFocus={() => setMenuOpen("search", true)}
            placeholder="Search patients or MRN…"
            aria-label="Search patients"
            className="h-9 w-44 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900 lg:w-64"
          />
          {searchOpen && query.trim() ? (
            <div className="absolute right-0 top-11 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {results.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  No patients match “{query}”.
                </p>
              ) : (
                <ul className="max-h-72 overflow-y-auto py-1">
                  {results.slice(0, 6).map((patient) => (
                    <li key={patient.id}>
                      <Link
                        href={`/patients/${patient.id}`}
                        onClick={() => {
                          setMenuOpen("search", false);
                          setQuery("");
                        }}
                        className="flex items-center gap-3 px-3 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Avatar
                          name={fullName(patient)}
                          size="sm"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {fullName(patient)}
                          </span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">
                            {patient.mrn} · {patient.status}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        <div ref={quickRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen("quick", !quickOpen)}
            aria-haspopup="menu"
            aria-expanded={quickOpen}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:px-3 dark:focus-visible:ring-offset-slate-900"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Quick add</span>
          </button>
          {quickOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-11 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              {[
                { href: "/patients/new", label: "New Patient", icon: UserPlus },
                {
                  href: "/appointments/new",
                  label: "New Appointment",
                  icon: CalendarPlus,
                },
                { href: "/billing/new", label: "New Invoice", icon: ReceiptText },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <item.icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "UPDATE_SETTINGS",
              payload: { theme: isDark ? "light" : "dark" },
            })
          }
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen("notifications", !notificationsOpen)}
            aria-label={`Notifications${notificationCount ? `, ${notificationCount} items` : ""}`}
            aria-haspopup="menu"
            aria-expanded={notificationsOpen}
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            ) : null}
          </button>
          {notificationsOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-11 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Notifications
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live alerts from hospital data
                </p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <Link
                  href="/appointments"
                  className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <CalendarDays className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>
                    <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                      {todaysAppointments.length} upcoming appointment
                      {todaysAppointments.length === 1 ? "" : "s"} today
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Review the daily schedule
                    </span>
                  </span>
                </Link>
                <Link
                  href="/laboratory"
                  className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <FlaskConical className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>
                    <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                      {pendingLabs.length} pending lab test
                      {pendingLabs.length === 1 ? "" : "s"}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Awaiting processing or results
                    </span>
                  </span>
                </Link>
                <Link
                  href="/pharmacy"
                  className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Pill className="mt-0.5 h-4 w-4 text-red-600 dark:text-red-400" />
                  <span>
                    <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                      {lowStock.length} medicine
                      {lowStock.length === 1 ? "" : "s"} at or below reorder level
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Restock soon to avoid shortages
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-2 dark:border-slate-700">
          <Avatar name="Admin" size="sm" />
          <div className={cn("hidden leading-tight lg:block")}>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Admin
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
