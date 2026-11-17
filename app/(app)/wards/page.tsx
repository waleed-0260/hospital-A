"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  Building2,
  CheckCircle2,
  LogOut,
  Wrench,
  ArrowLeftRight,
  UserPlus,
} from "lucide-react";
import { useHospital } from "@/context/HospitalProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { AdmitForm } from "@/components/forms/AdmitForm";
import { WARD_TYPES, statusTone } from "@/lib/constants";
import { formatDate, fullName } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function WardsPage() {
  const { state, dispatch } = useHospital();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("All");
  const [activeBedId, setActiveBedId] = useState<string | null>(null);
  const [view, setView] = useState<"details" | "admit" | "transfer">("details");
  const [transferBedId, setTransferBedId] = useState("");

  const activeBed = state.beds.find((bed) => bed.id === activeBedId);
  const activePatient = activeBed?.patientId
    ? state.patients.find((patient) => patient.id === activeBed.patientId)
    : undefined;
  const activeWard = activeBed
    ? state.wards.find((ward) => ward.id === activeBed.wardId)
    : undefined;

  const stats = useMemo(() => {
    const total = state.beds.length;
    const occupied = state.beds.filter((bed) => bed.status === "Occupied").length;
    const maintenance = state.beds.filter(
      (bed) => bed.status === "Maintenance"
    ).length;
    return {
      total,
      occupied,
      available: total - occupied - maintenance,
      maintenance,
      percent: total ? Math.round((occupied / total) * 100) : 0,
    };
  }, [state.beds]);

  const wards = state.wards.filter(
    (ward) => typeFilter === "All" || ward.type === typeFilter
  );

  const availableBeds = state.beds.filter(
    (bed) => bed.status === "Available" && bed.id !== activeBedId
  );

  const closeModal = () => {
    setActiveBedId(null);
    setView("details");
    setTransferBedId("");
  };

  const openBed = (id: string) => {
    setActiveBedId(id);
    setView("details");
    setTransferBedId("");
  };

  const setMaintenance = (id: string) => {
    const bed = state.beds.find((item) => item.id === id);
    if (!bed) return;
    dispatch({
      type: "UPDATE_BED",
      payload: {
        ...bed,
        status: "Maintenance",
        patientId: undefined,
        admittedAt: undefined,
      },
    });
    toast({
      title: "Bed set to maintenance",
      description: `Bed ${bed.bedNumber} is temporarily unavailable.`,
    });
    closeModal();
  };

  const markAvailable = (id: string) => {
    const bed = state.beds.find((item) => item.id === id);
    if (!bed) return;
    dispatch({
      type: "UPDATE_BED",
      payload: {
        ...bed,
        status: "Available",
        patientId: undefined,
        admittedAt: undefined,
      },
    });
    toast({
      title: "Bed available",
      description: `Bed ${bed.bedNumber} is ready for admission.`,
    });
    closeModal();
  };

  const handleDischarge = () => {
    if (!activeBed?.patientId) return;
    dispatch({
      type: "DISCHARGE_PATIENT",
      payload: { patientId: activeBed.patientId },
    });
    toast({
      title: "Patient discharged",
      description: `Bed ${activeBed.bedNumber} is now available.`,
    });
    closeModal();
  };

  const handleTransfer = () => {
    if (!activeBed?.patientId || !transferBedId) return;
    const target = state.beds.find((bed) => bed.id === transferBedId);
    if (!target) return;
    dispatch({
      type: "TRANSFER_PATIENT",
      payload: {
        patientId: activeBed.patientId,
        toBedId: transferBedId,
        admittedAt: activeBed.admittedAt ?? new Date().toISOString(),
      },
    });
    toast({
      title: "Patient transferred",
      description: `Moved to bed ${target.bedNumber}.`,
    });
    closeModal();
  };

  const bedStyles: Record<string, string> = {
    Available:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
    Occupied:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
    Maintenance:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  };

  return (
    <div>
      <PageHeader
        title="Wards & Beds"
        description="Monitor bed occupancy, admit patients, transfer between wards, and manage maintenance."
        actions={
          <Select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter by ward type"
            className="w-40"
          >
            <option value="All">All ward types</option>
            {WARD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300">
            <BedDouble className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total beds
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {stats.total}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300">
            <BedDouble className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Occupied
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {stats.occupied}{" "}
              <span className="text-xs font-normal text-slate-400">
                ({stats.percent}%)
              </span>
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Available
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {stats.available}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
            <Wrench className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Maintenance
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {stats.maintenance}
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        {wards.map((ward) => {
          const beds = state.beds.filter((bed) => bed.wardId === ward.id);
          const occupied = beds.filter(
            (bed) => bed.status === "Occupied"
          ).length;
          const percent = beds.length
            ? Math.round((occupied / beds.length) * 100)
            : 0;
          return (
            <Card key={ward.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <CardTitle>{ward.name}</CardTitle>
                  </div>
                  <Badge tone={statusTone(ward.type)}>{ward.type}</Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Floor {ward.floor}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {occupied}/{beds.length} occupied
                  </span>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        percent >= 80
                          ? "bg-red-500"
                          : percent >= 50
                            ? "bg-amber-500"
                            : "bg-teal-500"
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {beds.map((bed) => {
                    const patient = bed.patientId
                      ? state.patients.find(
                          (item) => item.id === bed.patientId
                        )
                      : undefined;
                    return (
                      <button
                        key={bed.id}
                        type="button"
                        onClick={() => openBed(bed.id)}
                        className={cn(
                          "flex flex-col items-start rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                          bedStyles[bed.status]
                        )}
                      >
                        <span className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide">
                          {bed.bedNumber}
                          <BedDouble className="h-3.5 w-3.5 opacity-70" />
                        </span>
                        <span className="mt-2 line-clamp-1 text-sm font-medium">
                          {patient ? fullName(patient) : bed.status}
                        </span>
                        <span className="text-[10px] opacity-80">
                          {patient
                            ? bed.admittedAt
                              ? `Since ${formatDate(bed.admittedAt)}`
                              : "Admitted"
                            : bed.status === "Available"
                              ? "Ready for admission"
                              : "Temporarily closed"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Modal
        open={Boolean(activeBed)}
        onClose={closeModal}
        title={
          view === "admit"
            ? "Admit patient"
            : view === "transfer"
              ? "Transfer patient"
              : activeBed
                ? `Bed ${activeBed.bedNumber}`
                : "Bed"
        }
        description={
          view === "details"
            ? activeWard
              ? `${activeWard.name} · Floor ${activeWard.floor}`
              : undefined
            : undefined
        }
      >
        {activeBed && view === "admit" ? (
          <AdmitForm bed={activeBed} onDone={closeModal} onCancel={closeModal} />
        ) : null}

        {activeBed && view === "transfer" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Transfer{" "}
              <span className="font-medium">
                {activePatient ? fullName(activePatient) : "the patient"}
              </span>{" "}
              to a different bed.
            </p>
            <FormField label="Destination bed" htmlFor="transferBed" required>
              <Select
                id="transferBed"
                value={transferBedId}
                onChange={(event) => setTransferBedId(event.target.value)}
              >
                <option value="">Select an available bed</option>
                {availableBeds.map((bed) => {
                  const ward = state.wards.find(
                    (item) => item.id === bed.wardId
                  );
                  return (
                    <option key={bed.id} value={bed.id}>
                      {bed.bedNumber} · {ward?.name ?? "Ward"}
                    </option>
                  );
                })}
              </Select>
            </FormField>
            {availableBeds.length === 0 ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                No available beds for transfer.
              </p>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setView("details")}>
                Back
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={!transferBedId}
                icon={<ArrowLeftRight className="h-4 w-4" />}
              >
                Transfer
              </Button>
            </div>
          </div>
        ) : null}

        {activeBed && view === "details" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge tone={statusTone(activeBed.status)} dot>
                {activeBed.status}
              </Badge>
              {activeWard ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeWard.name}
                </span>
              ) : null}
            </div>

            {activePatient ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <Avatar name={fullName(activePatient)} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/patients/${activePatient.id}`}
                    className="block truncate text-sm font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                  >
                    {fullName(activePatient)}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activePatient.mrn} · {activePatient.gender}
                  </p>
                  {activeBed.admittedAt ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Admitted {formatDate(activeBed.admittedAt)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                {activeBed.status === "Maintenance"
                  ? "This bed is under maintenance and cannot accept patients."
                  : "This bed is ready for a new admission."}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              {activeBed.status === "Available" ? (
                <>
                  <Button
                    variant="secondary"
                    icon={<Wrench className="h-4 w-4" />}
                    onClick={() => setMaintenance(activeBed.id)}
                  >
                    Set maintenance
                  </Button>
                  <Button
                    icon={<UserPlus className="h-4 w-4" />}
                    onClick={() => setView("admit")}
                  >
                    Admit patient
                  </Button>
                </>
              ) : null}
              {activeBed.status === "Maintenance" ? (
                <Button
                  variant="success"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => markAvailable(activeBed.id)}
                >
                  Mark available
                </Button>
              ) : null}
              {activeBed.status === "Occupied" ? (
                <>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeftRight className="h-4 w-4" />}
                    onClick={() => setView("transfer")}
                  >
                    Transfer
                  </Button>
                  <Button
                    variant="danger"
                    icon={<LogOut className="h-4 w-4" />}
                    onClick={handleDischarge}
                  >
                    Discharge
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
