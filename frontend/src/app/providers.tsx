"use client";

import { FilterProvider } from "@/context/FilterContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <FilterProvider>{children}</FilterProvider>;
}
