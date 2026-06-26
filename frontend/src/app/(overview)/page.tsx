/**
 * OverviewPage — Página principal del dashboard.
 * Muestra filtros globales, tarjetas KPI, gráfico de tendencia y tabla
 * Top 10 de productos con alternancia GMV / Revenue.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useFilters } from "@/context/FilterContext";
import { apiClient, ApiClientError } from "@/services/apiClient";
import { GlobalFilters, KpiGrid, TrendChart } from "@/components/dashboard";
import { Card, Table, type Column } from "@/components/ui";
import type { KpiSummaryResponse, RevenueTrendResponse, ProductRankingEntry } from "@/types";
import { CATEGORY_LABELS } from "@/constants";
import styles from "@/styles/app/overview.module.css";

type Metric = "gmv" | "revenue";

type OverviewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; kpis: KpiSummaryResponse; trend: RevenueTrendResponse };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export default function OverviewPage() {
  const { toQueryParams } = useFilters();
  const [state, setState] = useState<OverviewState>({ status: "loading" });
  const [metric, setMetric] = useState<Metric>("revenue");

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

  const productData =
    state.status === "success"
      ? metric === "gmv"
        ? state.kpis.topProductsByGmv
        : state.kpis.topProductsByRevenue
      : [];

  const productColumns: Column<ProductRankingEntry>[] = [
    {
      key: "rank",
      label: "#",
      align: "right",
      render: (_item, index) => (
        <span
          style={{
            fontWeight: "var(--font-weight-bold)",
            color: index < 3 ? "var(--color-primary-400)" : "var(--color-text-muted)",
          }}
        >
          {index + 1}
        </span>
      ),
    },
    {
      key: "productCategory",
      label: "Categoría",
      render: (item) => CATEGORY_LABELS[item.productCategory] || item.productCategory || "Sin categoría",
    },
    {
      key: "totalSold",
      label: "Unidades Vendidas",
      align: "right",
      render: (item) => formatNumber(item.totalSold),
    },
    {
      key: "gmv",
      label: "GMV (BRL)",
      align: "right",
      render: (item) => formatCurrency(item.gmv),
    },
    {
      key: "revenue",
      label: "Revenue (BRL)",
      align: "right",
      render: (item) => formatCurrency(item.revenue),
    },
  ];

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

          <Card title={`Top 10 Productos`}>
            <div className={styles.toggleBar}>
              <button
                onClick={() => setMetric("revenue")}
                className={`${styles.toggleBtn} ${metric === "revenue" ? styles.toggleBtnActive : styles.toggleBtnInactive}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setMetric("gmv")}
                className={`${styles.toggleBtn} ${metric === "gmv" ? styles.toggleBtnActive : styles.toggleBtnInactive}`}
              >
                GMV
              </button>
            </div>
            <Table
              columns={productColumns}
              data={productData}
              emptyMessage="No hay productos para el período seleccionado"
            />
          </Card>
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
        {Array.from({ length: 7 }).map((_, i) => (
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
