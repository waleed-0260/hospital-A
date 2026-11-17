"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { medicineSchema, type MedicineFormValues } from "@/lib/schemas";
import { MEDICINE_CATEGORIES } from "@/lib/constants";
import { makeId } from "@/lib/utils";
import type { Medicine } from "@/types";

interface MedicineFormProps {
  medicine?: Medicine;
  onDone: () => void;
  onCancel: () => void;
}

export function MedicineForm({ medicine, onDone, onCancel }: MedicineFormProps) {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: medicine?.name ?? "",
      genericName: medicine?.genericName ?? "",
      category: medicine?.category ?? MEDICINE_CATEGORIES[0],
      manufacturer: medicine?.manufacturer ?? "",
      stock: String(medicine?.stock ?? 0),
      reorderLevel: String(medicine?.reorderLevel ?? 20),
      unitPrice: String(medicine?.unitPrice ?? 0),
      expiryDate:
        medicine?.expiryDate ?? new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (values: MedicineFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    const payload: Medicine = {
      id:
        medicine?.id ??
        makeId("M", state.medicines.map((item) => item.id)),
      name: values.name,
      genericName: values.genericName,
      category: values.category,
      manufacturer: values.manufacturer,
      stock: Number(values.stock),
      reorderLevel: Number(values.reorderLevel),
      unitPrice: Number(values.unitPrice),
      expiryDate: values.expiryDate,
    };
    dispatch({
      type: medicine ? "UPDATE_MEDICINE" : "ADD_MEDICINE",
      payload,
    });
    toast({
      title: medicine ? "Medicine updated" : "Medicine added",
      description: `${values.name} has been saved to inventory.`,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Medicine name" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" {...register("name")} invalid={Boolean(errors.name)} />
        </FormField>
        <FormField label="Generic name" htmlFor="genericName" error={errors.genericName?.message} required>
          <Input id="genericName" {...register("genericName")} invalid={Boolean(errors.genericName)} />
        </FormField>
        <FormField label="Category" htmlFor="category" error={errors.category?.message} required>
          <Select id="category" {...register("category")}>
            {MEDICINE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Manufacturer" htmlFor="manufacturer" error={errors.manufacturer?.message} required>
          <Input id="manufacturer" {...register("manufacturer")} invalid={Boolean(errors.manufacturer)} />
        </FormField>
        <FormField label="Stock" htmlFor="stock" error={errors.stock?.message} required>
          <Input id="stock" type="number" min={0} {...register("stock")} invalid={Boolean(errors.stock)} />
        </FormField>
        <FormField label="Reorder level" htmlFor="reorderLevel" error={errors.reorderLevel?.message} required>
          <Input id="reorderLevel" type="number" min={0} {...register("reorderLevel")} invalid={Boolean(errors.reorderLevel)} />
        </FormField>
        <FormField label="Unit price ($)" htmlFor="unitPrice" error={errors.unitPrice?.message} required>
          <Input id="unitPrice" type="number" step="0.01" min={0} {...register("unitPrice")} invalid={Boolean(errors.unitPrice)} />
        </FormField>
        <FormField label="Expiry date" htmlFor="expiryDate" error={errors.expiryDate?.message} required>
          <Input id="expiryDate" type="date" {...register("expiryDate")} invalid={Boolean(errors.expiryDate)} />
        </FormField>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {medicine ? "Save changes" : "Add medicine"}
        </Button>
      </div>
    </form>
  );
}
