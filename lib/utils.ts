export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function makeId(prefix: string, existing: string[], pad = 3): string {
  let max = 0;
  for (const value of existing) {
    const match = value.match(/(\d+)$/);
    if (match) {
      const parsed = Number.parseInt(match[1], 10);
      if (parsed > max) max = parsed;
    }
  }
  return `${prefix}${String(max + 1).padStart(pad, "0")}`;
}

export function makeInvoiceNo(existing: string[]): string {
  const year = new Date().getFullYear();
  let max = 0;
  for (const value of existing) {
    const match = value.match(/-(\d+)$/);
    if (match) {
      const parsed = Number.parseInt(match[1], 10);
      if (parsed > max) max = parsed;
    }
  }
  return `INV-${year}-${String(max + 1).padStart(4, "0")}`;
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function invoiceSubtotal(
  items: Array<{ quantity: number; unitPrice: number }>
): number {
  return roundMoney(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  );
}

export function calcInvoiceTotal(
  items: Array<{ quantity: number; unitPrice: number }>,
  discountPercent: number,
  taxPercent: number
): number {
  const subtotal = invoiceSubtotal(items);
  const discount = subtotal * (clampPercent(discountPercent) / 100);
  const taxed = (subtotal - discount) * (1 + clampPercent(taxPercent) / 100);
  return roundMoney(taxed);
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

export function matchesQuery(
  query: string,
  values: Array<string | number | null | undefined>
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(normalized)
  );
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
