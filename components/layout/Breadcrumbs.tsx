import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <li className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 rounded transition hover:text-teal-700 dark:hover:text-teal-300"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
            {item.href ? (
              <Link
                href={item.href}
                className="truncate rounded transition hover:text-teal-700 dark:hover:text-teal-300"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="truncate font-medium text-slate-700 dark:text-slate-200"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
