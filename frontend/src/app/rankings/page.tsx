"use client";

import { useEffect, useState, useCallback } from "react";
import { useFilters } from "@/context/FilterContext";
import { apiClient, ApiClientError } from "@/services/apiClient";
import { GlobalFilters } from "@/components/dashboard";
import { Card, Table, type Column } from "@/components/ui";
import type { ProductRankingItem } from "@/types";
import styles from "./rankings.module.css";

type Metric = "revenue" | "totalSold";

type RankingsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ProductRankingItem[] };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

const METRIC_LABELS: Record<Metric, string> = {
  revenue: "Ingresos",
  totalSold: "Unidades Vendidas",
};

export default function RankingsPage() {
  const { toQueryParams } = useFilters();
  const [state, setState] = useState<RankingsState>({ status: "loading" });
  const [metric, setMetric] = useState<Metric>("revenue");

  const fetchData = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const data = await apiClient.getTopProducts(toQueryParams);
      setState({ status: "success", data });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Error inesperado al cargar el ranking";
      setState({ status: "error", message });
    }
  }, [toQueryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedData =
    state.status === "success"
      ? [...state.data].sort((a, b) => b[metric] - a[metric])
      : [];

  const columns: Column<ProductRankingItem>[] = [
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
      render: (item) => item.productCategory || "Sin categoría",
    },
    {
      key: "productId",
      label: "ID Producto",
      render: (item) => (
        <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)" }}>
          {item.productId.slice(0, 12)}...
        </span>
      ),
    },
    {
      key: "totalSold",
      label: "Unidades Vendidas",
      align: "right",
      render: (item) => formatNumber(item.totalSold),
    },
    {
      key: "revenue",
      label: metric === "revenue" ? "Ingresos (BRL)" : "GMV (BRL)",
      align: "right",
      render: (item) => formatCurrency(item.revenue),
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Ranking de Productos</h1>
          <p className={styles.subtitle}>
            Top productos ordenados por {METRIC_LABELS[metric].toLowerCase()}
          </p>
        </div>

        <div className={styles.toggle}>
          <button
            className={`${styles.toggleButton} ${metric === "revenue" ? styles.toggleButtonActive : ""}`}
            onClick={() => setMetric("revenue")}
            type="button"
          >
            Revenue
          </button>
          <button
            className={`${styles.toggleButton} ${metric === "totalSold" ? styles.toggleButtonActive : ""}`}
            onClick={() => setMetric("totalSold")}
            type="button"
          >
            Unidades
          </button>
        </div>
      </div>

      <GlobalFilters />

      {state.status === "loading" && (
        <Card>
          <div style={{ padding: "var(--spacing-2xl)", textAlign: "center", color: "var(--color-text-muted)" }}>
            Cargando ranking...
          </div>
        </Card>
      )}

      {state.status === "error" && (
        <div
          style={{
            padding: "var(--spacing-xl)",
            textAlign: "center",
            border: "1px solid var(--color-error)",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "rgba(239, 68, 68, 0.06)",
          }}
        >
          <p style={{ color: "var(--color-error)", marginBottom: "var(--spacing-md)" }}>
            {state.message}
          </p>
          <button
            onClick={fetchData}
            style={{
              padding: "var(--spacing-sm) var(--spacing-xl)",
              backgroundColor: "var(--color-primary-600)",
              color: "var(--color-text-primary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {state.status === "success" && (
        <Table
          columns={columns}
          data={sortedData}
          emptyMessage="No hay productos para el período seleccionado"
        />
      )}
    </main>
  );
}
