"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  initialSortKey?: string;
  initialSortDirection?: "asc" | "desc";
  skeletonRows?: number;
  footer?: ReactNode;
}

export function Table<T>({
  columns,
  data,
  getRowKey,
  loading = false,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyAction,
  initialSortKey,
  initialSortDirection = "asc",
  skeletonRows = 6,
  footer,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey ?? null);
  const [direction, setDirection] = useState<"asc" | "desc">(
    initialSortDirection
  );

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const column = columns.find((item) => item.key === sortKey);
    const getValue = column?.sortValue;
    if (!getValue) return data;
    return [...data].sort((a, b) => {
      const left = getValue(a);
      const right = getValue(b);
      if (typeof left === "number" && typeof right === "number") {
        return direction === "asc" ? left - right : right - left;
      }
      const comparison = String(left).localeCompare(String(right));
      return direction === "asc" ? comparison : -comparison;
    });
  }, [data, columns, sortKey, direction]);

  const toggleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;
    if (sortKey === column.key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setDirection("asc");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {columns.map((column) => {
              const active = sortKey === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    active
                      ? direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
                    column.headerClassName
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className="inline-flex items-center gap-1 rounded transition hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:text-slate-200"
                    >
                      {column.header}
                      {active ? (
                        direction === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading
            ? Array.from({ length: skeletonRows }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                  ))}
                </tr>
              ))
            : sorted.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-3 align-middle text-slate-700 dark:text-slate-300",
                        column.className
                      )}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
        {!loading && footer ? (
          <tfoot className="border-t border-slate-200 dark:border-slate-800">
            {footer}
          </tfoot>
        ) : null}
      </table>
      {!loading && sorted.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={<SearchX className="h-6 w-6" />}
          action={emptyAction}
        />
      ) : null}
    </div>
  );
}
