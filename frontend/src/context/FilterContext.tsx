/**
 * FilterContext — Estado global de filtros para el dashboard.
 * Provee los valores actuales de fecha, estado, status de orden y categoría,
 * junto con funciones setter y un objeto toQueryParams para consumir la API.
 *
 * Uso: envolver la aplicación con <FilterProvider> y acceder con useFilters().
 */
"use client";

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
  orderStatus: "",
  category: "",
};

// ─── Interface del contexto ─────────────────────────────────────────────────

interface FilterContextValue {
  filters: GlobalFilters;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  setCustomerState: (value: string) => void;
  setOrderStatus: (value: string) => void;
  setCategory: (value: string) => void;
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

  const setOrderStatus = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, orderStatus: value }));
  }, []);

  const setCategory = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, category: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const toQueryParams = useMemo<FilterParams>(
    () => ({
      from: filters.dateFrom || undefined,
      to: filters.dateTo || undefined,
      customer_state: filters.customerState || undefined,
      order_status: filters.orderStatus || undefined,
      category: filters.category || undefined,
    }),
    [filters],
  );

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      setDateFrom,
      setDateTo,
      setCustomerState,
      setOrderStatus,
      setCategory,
      resetFilters,
      toQueryParams,
    }),
    [filters, setDateFrom, setDateTo, setCustomerState, setOrderStatus, setCategory, resetFilters, toQueryParams],
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
