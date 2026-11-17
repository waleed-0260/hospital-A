import { PageHeader } from "@/components/layout/PageHeader";
import { InvoiceForm } from "@/components/forms/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div>
      <PageHeader
        title="New invoice"
        description="Create a patient invoice with line items, discounts, tax, and payment."
      />
      <InvoiceForm />
    </div>
  );
}
