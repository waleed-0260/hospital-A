"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { paymentSchema, type PaymentFormValues } from "@/lib/schemas";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Invoice } from "@/types";

interface PaymentFormProps {
  invoice: Invoice;
  onDone: () => void;
  onCancel: () => void;
}

export function PaymentForm({ invoice, onDone, onCancel }: PaymentFormProps) {
  const { dispatch } = useHospital();
  const { toast } = useToast();
  const balance = Math.max(0, invoice.total - invoice.paid);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: balance.toFixed(2),
      paymentMethod: invoice.paymentMethod ?? "Cash",
    },
  });

  const onSubmit = async (values: PaymentFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    if (Number(values.amount) > balance) {
      toast({
        title: "Amount exceeds balance",
        description: `The maximum outstanding balance is ${formatCurrency(balance)}.`,
        tone: "error",
      });
      return;
    }
    dispatch({
      type: "RECORD_PAYMENT",
      payload: {
        id: invoice.id,
        amount: Number(values.amount),
        paymentMethod: values.paymentMethod,
      },
    });
    toast({
      title: "Payment recorded",
      description: `${formatCurrency(Number(values.amount))} applied to ${invoice.invoiceNo}.`,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Outstanding balance:{" "}
        <span className="font-semibold text-slate-900 dark:text-white">
          {formatCurrency(balance)}
        </span>
      </p>
      <FormField label="Amount ($)" htmlFor="amount" error={errors.amount?.message} required>
        <Input id="amount" type="number" min={0.01} step="0.01" {...register("amount")} invalid={Boolean(errors.amount)} />
      </FormField>
      <FormField label="Payment method" htmlFor="paymentMethod" error={errors.paymentMethod?.message} required>
        <Select id="paymentMethod" {...register("paymentMethod")}>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Record payment
        </Button>
      </div>
    </form>
  );
}
