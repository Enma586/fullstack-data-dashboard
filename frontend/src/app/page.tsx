"use client";

import { useEffect, useState, useCallback } from "react";
import { useFilters } from "@/context/FilterContext";
import { apiClient, ApiClientError } from "@/services/apiClient";
import { GlobalFilters, KpiGrid, TrendChart } from "@/components/dashboard";
import type { KpiSummaryResponse, RevenueTrendResponse } from "@/types";
import styles from "./overview.module.css";

type OverviewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; kpis: KpiSummaryResponse; trend: RevenueTrendResponse };

export default function OverviewPage() {
  const { toQueryParams } = useFilters();
  const [state, setState] = useState<OverviewState>({ status: "loading" });

  const fetchData = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const [kpis, trend] = await Promise.all([
        apiClient.getKpis(toQueryParams),
        apiClient.getRevenueTrend({ ...toQueryParams, grain: "week" }),
      ]);

      setState({ status: "success", kpis, trend });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Error inesperado al cargar los datos";
      setState({ status: "error", message });
    }
  }, [toQueryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Resumen General</h1>
          <p className={styles.subtitle}>
            Indicadores clave de desempeño del período seleccionado
          </p>
        </div>
      </div>

      <GlobalFilters />

      {state.status === "loading" && <LoadingSkeleton />}

      {state.status === "error" && (
        <ErrorDisplay message={state.message} onRetry={fetchData} />
      )}

      {state.status === "success" && (
        <>
          <KpiGrid data={state.kpis} />
          <TrendChart data={state.trend} />
        </>
      )}
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 120,
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
      <div
        style={{
          height: 380,
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    </>
  );
}

function ErrorDisplay({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-3xl)",
        textAlign: "center",
        border: "1px solid var(--color-error)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "rgba(239, 68, 68, 0.06)",
      }}
    >
      <p
        style={{
          color: "var(--color-error)",
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          marginBottom: "var(--spacing-sm)",
        }}
      >
        Error al cargar los datos
      </p>
      <p
        style={{
          color: "var(--color-text-secondary)",
          fontSize: "var(--font-size-sm)",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "var(--spacing-sm) var(--spacing-xl)",
          backgroundColor: "var(--color-primary-600)",
          color: "var(--color-text-primary)",
          border: "none",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-medium)",
          cursor: "pointer",
          transition: "background-color var(--transition-fast)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-500)")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-600)")}
      >
        Reintentar
      </button>
    </div>
  );
}
