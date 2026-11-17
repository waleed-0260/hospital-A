import type { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

type StatAccent = "teal" | "blue" | "amber" | "red" | "emerald" | "purple";

const accents: Record<StatAccent, string> = {
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
  red: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  hint?: string;
  accent?: StatAccent;
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = "teal",
}: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hint}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accents[accent]
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}
