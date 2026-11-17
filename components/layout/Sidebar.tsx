"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BedDouble,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Pill,
  ReceiptText,
  Settings,
  Stethoscope,
  Users,
  X,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { APP_NAME, APP_NAV, APP_VERSION } from "@/lib/constants";
import { useHospital } from "@/context/HospitalProvider";
import { cn } from "@/lib/utils";

const icons: Record<string, ComponentType<LucideProps>> = {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Stethoscope,
  Building2,
  BedDouble,
  FlaskConical,
  Pill,
  ReceiptText,
  Settings,
};

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { state } = useHospital();

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:translate-x-0",
        collapsed ? "lg:w-20" : "lg:w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800",
          collapsed && "lg:justify-center lg:px-2"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <HeartPulse className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className={cn("min-w-0", collapsed && "lg:hidden")}>
            <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
              {APP_NAME}
            </span>
            <span className="block truncate text-[10px] uppercase tracking-wider text-slate-400">
              Hospital Management
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:block"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {APP_NAV.map((item) => {
          const Icon = icons[item.icon] ?? LayoutDashboard;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                active
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                collapsed && "lg:justify-center lg:px-2"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span className={cn("truncate", collapsed && "lg:hidden")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-100 p-3 dark:border-slate-800">
        <div
          className={cn(
            "rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60",
            collapsed && "lg:flex lg:justify-center lg:p-2"
          )}
          title={state.settings.name}
        >
          <p
            className={cn(
              "truncate text-xs font-semibold text-slate-700 dark:text-slate-200",
              collapsed && "lg:hidden"
            )}
          >
            {state.settings.name}
          </p>
          <p
            className={cn(
              "mt-0.5 text-[10px] text-slate-400",
              collapsed && "lg:hidden"
            )}
          >
            Version {APP_VERSION}
          </p>
          {collapsed ? (
            <span className="hidden text-[10px] font-medium text-slate-400 lg:block">
              v{APP_VERSION}
            </span>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
