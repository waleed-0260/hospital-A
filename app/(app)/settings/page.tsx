"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Download,
  Moon,
  RefreshCcw,
  Save,
  Sun,
  Trash2,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { settingsSchema, type SettingsFormValues } from "@/lib/schemas";
import { APP_NAME, APP_VERSION } from "@/lib/constants";
import { defaultSettings } from "@/data/settings";
import { cn, downloadJson } from "@/lib/utils";

export default function SettingsPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: state.settings.name,
      address: state.settings.address,
      phone: state.settings.phone,
      email: state.settings.email,
    },
  });

  const onSubmit = async (values: SettingsFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    dispatch({ type: "UPDATE_SETTINGS", payload: values });
    reset(values);
    toast({
      title: "Settings saved",
      description: "Hospital profile details have been updated.",
    });
  };

  const handleReset = () => {
    dispatch({ type: "RESET_DATA" });
    const initial = defaultSettings();
    reset({
      name: initial.name,
      address: initial.address,
      phone: initial.phone,
      email: initial.email,
    });
    setConfirmReset(false);
    toast({
      title: "Demo data reset",
      description: "All hospital data has been restored to the original demo set.",
    });
  };

  const exportData = () => {
    downloadJson("medicore-hms-data.json", state);
    toast({
      title: "Export started",
      description: "Your hospital data is downloading as JSON.",
    });
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage hospital profile, appearance, and demo data."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Hospital profile</CardTitle>
              <CardDescription>
                Displayed across the app, invoices, and printed documents.
              </CardDescription>
            </div>
            <Building2 className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                label="Hospital name"
                htmlFor="name"
                error={errors.name?.message}
                required
              >
                <Input
                  id="name"
                  {...register("name")}
                  invalid={Boolean(errors.name)}
                />
              </FormField>
              <FormField
                label="Address"
                htmlFor="address"
                error={errors.address?.message}
                required
              >
                <Input
                  id="address"
                  {...register("address")}
                  invalid={Boolean(errors.address)}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Phone"
                  htmlFor="phone"
                  error={errors.phone?.message}
                  required
                >
                  <Input
                    id="phone"
                    {...register("phone")}
                    invalid={Boolean(errors.phone)}
                  />
                </FormField>
                <FormField
                  label="Email"
                  htmlFor="email"
                  error={errors.email?.message}
                  required
                >
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    invalid={Boolean(errors.email)}
                  />
                </FormField>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={!isDirty}
                  icon={<Save className="h-4 w-4" />}
                >
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Choose how MediCore looks.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_SETTINGS",
                      payload: { theme: "light" },
                    })
                  }
                  aria-pressed={state.settings.theme === "light"}
                  className={cn(
                    "rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    state.settings.theme === "light"
                      ? "border-teal-500 bg-teal-50 dark:border-teal-400"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm">
                    <Sun className="h-5 w-5" />
                  </span>
                  <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                    Light
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Bright daytime view
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_SETTINGS",
                      payload: { theme: "dark" },
                    })
                  }
                  aria-pressed={state.settings.theme === "dark"}
                  className={cn(
                    "rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    state.settings.theme === "dark"
                      ? "border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-100 shadow-sm">
                    <Moon className="h-5 w-5" />
                  </span>
                  <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                    Dark
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Reduced eye strain
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>About</CardTitle>
                <CardDescription>Application details.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-semibold text-slate-900 dark:text-white">
                {APP_NAME}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Version {APP_VERSION}
              </p>
              <p className="pt-2 text-xs text-slate-500 dark:text-slate-400">
                A complete hospital management workspace running on local demo
                data stored in your browser.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Data management</CardTitle>
              <CardDescription>
                Export your workspace or restore the original demo dataset.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              icon={<Download className="h-4 w-4" />}
              onClick={exportData}
            >
              Export data
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmReset(true)}
            >
              Reset demo data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Storage</CardTitle>
              <CardDescription>Local browser persistence.</CardDescription>
            </div>
            <RefreshCcw className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <p>
              All changes are saved automatically to this browser. Clearing
              browser storage will reset the workspace.
            </p>
            <p>
              {state.patients.length} patients · {state.staff.length} staff ·{" "}
              {state.invoices.length} invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data"
        description="This will discard all changes and restore the original patients, staff, appointments, records, lab tests, medicines, and invoices. Your theme preference is kept."
        confirmLabel="Reset data"
        onConfirm={handleReset}
        onClose={() => setConfirmReset(false)}
      />
    </div>
  );
}
