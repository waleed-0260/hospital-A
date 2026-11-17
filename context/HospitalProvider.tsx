"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
} from "react";
import { createEmptyData, createInitialData } from "@/data";
import { APP_NAME } from "@/lib/constants";
import { hospitalReducer, type HospitalAction } from "./reducer";
import type { HospitalData, Patient } from "@/types";

const STORAGE_KEY = "medicore-hms-state-v1";

interface HospitalContextValue {
  state: HospitalData;
  dispatch: Dispatch<HospitalAction>;
  hydrated: boolean;
}

const HospitalContext = createContext<HospitalContextValue | null>(null);

function isHospitalData(value: unknown): value is HospitalData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const collections = [
    "patients",
    "staff",
    "departments",
    "appointments",
    "records",
    "wards",
    "beds",
    "labTests",
    "medicines",
    "invoices",
  ];
  return (
    collections.every((key) => Array.isArray(candidate[key])) &&
    typeof candidate.settings === "object" &&
    candidate.settings !== null
  );
}

function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-xl font-bold text-white shadow-lg shadow-teal-600/20">
            M
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {APP_NAME}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Preparing your workspace…
            </p>
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}

function subscribeHydrated() {
  return () => {};
}

function getHydratedClientSnapshot() {
  return true;
}

function getHydratedServerSnapshot() {
  return false;
}

function loadInitialState(): HospitalData {
  if (typeof window === "undefined") return createEmptyData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isHospitalData(parsed)) return parsed;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return createInitialData();
}

export function HospitalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    hospitalReducer,
    undefined,
    loadInitialState
  );
  const hydrated = useSyncExternalStore(
    subscribeHydrated,
    getHydratedClientSnapshot,
    getHydratedServerSnapshot
  );

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle(
      "dark",
      state.settings.theme === "dark"
    );
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be full or unavailable; the app keeps working in memory.
    }
  }, [state, hydrated]);

  const value = useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated]
  );

  if (!hydrated) return <BootScreen />;

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospital(): HospitalContextValue {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error("useHospital must be used within HospitalProvider");
  }
  return context;
}

export function usePatient(id?: string): Patient | undefined {
  const { state } = useHospital();
  if (!id) return undefined;
  return state.patients.find((patient) => patient.id === id);
}

export { STORAGE_KEY };
