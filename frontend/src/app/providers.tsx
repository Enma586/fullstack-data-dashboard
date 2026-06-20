/**
 * Providers — Envuelve la aplicación con los contextos globales.
 * Actualmente inyecta FilterProvider para el estado de filtros.
 */
"use client";

import { FilterProvider } from "@/context/FilterContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <FilterProvider>{children}</FilterProvider>;
}
