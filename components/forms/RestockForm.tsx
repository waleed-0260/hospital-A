"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { restockSchema, type RestockFormValues } from "@/lib/schemas";
import type { Medicine } from "@/types";

interface RestockFormProps {
  medicine: Medicine;
  onDone: () => void;
  onCancel: () => void;
}

export function RestockForm({ medicine, onDone, onCancel }: RestockFormProps) {
  const { dispatch } = useHospital();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RestockFormValues>({
    resolver: zodResolver(restockSchema),
    defaultValues: { quantity: "50" },
  });

  const onSubmit = async (values: RestockFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    dispatch({
      type: "RESTOCK_MEDICINE",
      payload: { id: medicine.id, quantity: Number(values.quantity) },
    });
    toast({
      title: "Stock updated",
      description: `${values.quantity} units added to ${medicine.name}.`,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Current stock for <span className="font-medium">{medicine.name}</span> is{" "}
        <span className="font-semibold text-slate-900 dark:text-white">
          {medicine.stock}
        </span>{" "}
        units (reorder level {medicine.reorderLevel}).
      </p>
      <FormField label="Quantity to add" htmlFor="quantity" error={errors.quantity?.message} required>
        <Input id="quantity" type="number" min={1} {...register("quantity")} invalid={Boolean(errors.quantity)} />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Restock
        </Button>
      </div>
    </form>
  );
}
