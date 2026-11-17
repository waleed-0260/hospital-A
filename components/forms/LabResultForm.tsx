"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import type { LabTest } from "@/types";

const resultSchema = z.object({
  result: z.string().trim().min(3, "Enter the lab result"),
  resultDate: z.string().min(1, "Result date is required"),
});

type ResultValues = z.infer<typeof resultSchema>;

interface LabResultFormProps {
  test: LabTest;
  onDone: () => void;
  onCancel: () => void;
}

export function LabResultForm({ test, onDone, onCancel }: LabResultFormProps) {
  const { dispatch } = useHospital();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResultValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      result: test.result ?? "",
      resultDate: test.resultDate ?? new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (values: ResultValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    dispatch({
      type: "UPDATE_LAB_TEST",
      payload: {
        ...test,
        status: "Completed",
        result: values.result,
        resultDate: values.resultDate,
      },
    });
    toast({
      title: "Lab result saved",
      description: `${test.testName} is now completed.`,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Result" htmlFor="result" error={errors.result?.message} required>
        <Textarea id="result" rows={4} {...register("result")} invalid={Boolean(errors.result)} />
      </FormField>
      <FormField label="Result date" htmlFor="resultDate" error={errors.resultDate?.message} required>
        <Input id="resultDate" type="date" {...register("resultDate")} invalid={Boolean(errors.resultDate)} />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save result
        </Button>
      </div>
    </form>
  );
}
