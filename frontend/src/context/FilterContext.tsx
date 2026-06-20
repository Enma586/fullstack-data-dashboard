"use client";

/* =============================================================================
   context/FilterContext.tsx — Estado global de filtros para el dashboard
   ============================================================================= */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { GlobalFilters, FilterParams } from "@/types";

// ─── Valores por defecto ────────────────────────────────────────────────────

const DEFAULT_FROM = "2016-01-01";
const DEFAULT_TO = "2018-12-31";

const DEFAULT_FILTERS: GlobalFilters = {
  dateFrom: DEFAULT_FROM,
  dateTo: DEFAULT_TO,
  customerState: "",
  paymentType: "",
};

// ─── Interface del contexto ─────────────────────────────────────────────────

interface FilterContextValue {
  filters: GlobalFilters;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  setCustomerState: (value: string) => void;
  setPaymentType: (value: string) => void;
  resetFilters: () => void;
  toQueryParams: FilterParams;
}

// ─── Contexto ───────────────────────────────────────────────────────────────

const FilterContext = createContext<FilterContextValue | null>(null);

// ─── Proveedor ──────────────────────────────────────────────────────────────

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<GlobalFilters>(DEFAULT_FILTERS);

  const setDateFrom = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, dateFrom: value }));
  }, []);

  const setDateTo = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, dateTo: value }));
  }, []);

  const setCustomerState = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, customerState: value }));
  }, []);

  const setPaymentType = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, paymentType: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const toQueryParams = useMemo<FilterParams>(
    () => ({
      from: filters.dateFrom || undefined,
      to: filters.dateTo || undefined,
      customer_state: filters.customerState || undefined,
      payment_type: filters.paymentType || undefined,
    }),
    [filters],
  );

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      setDateFrom,
      setDateTo,
      setCustomerState,
      setPaymentType,
      resetFilters,
      toQueryParams,
    }),
    [filters, setDateFrom, setDateTo, setCustomerState, setPaymentType, resetFilters, toQueryParams],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilters debe usarse dentro de un <FilterProvider>");
  }
  return ctx;
}
