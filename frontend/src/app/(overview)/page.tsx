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
import styles from "@/styles/app/overview.module.css";

type Metric = "gmv" | "revenue";

type OverviewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; kpis: KpiSummaryResponse; trend: RevenueTrendResponse };

const CATEGORY_LABELS: Record<string, string> = {
  bed_bath_table: "Cama, Mesa y Baño",
  health_beauty: "Salud y Belleza",
  sports_leisure: "Deportes y Ocio",
  furniture_decor: "Muebles y Decoración",
  housewares: "Utensilios Domésticos",
  watches_gifts: "Relojes y Regalos",
  telephony: "Telefonía",
  garden_tools: "Jardín y Herramientas",
  auto: "Automotriz",
  toys: "Juguetes",
  cool_stuff: "Novedades",
  perfumery: "Perfumería",
  computers: "Computadoras",
  informatica_accessories: "Informática y Accesorios",
  office_furniture: "Muebles de Oficina",
  stationery: "Papelería",
  electronics: "Electrónicos",
  audio: "Audio",
  cds_dvds_musicals: "CDs, DVDs y Música",
  music: "Música",
  dvds_blu_ray: "DVDs y Blu-ray",
  fixed_telephony: "Telefonía Fija",
  tablets_printing_image: "Tablets e Impresión",
  computers_accessories: "Accesorios de Computadora",
  pc_gamer: "PC Gamer",
  books_general_interest: "Libros",
  books_imported: "Libros Importados",
  christmas_supplies: "Suministros Navideños",
  agro_industry_and_commerce: "Agroindustria",
  construction_tools: "Herramientas de Construcción",
  construction_tools_afety: "Seguridad en Construcción",
  flowers: "Flores",
  food_drink: "Alimentos y Bebidas",
  food: "Alimentos",
  drinks: "Bebidas",
  home_comfort: "Confort del Hogar",
  home_appliances: "Electrodomésticos",
  home_appliances_2: "Electrodomésticos 2",
  home_confort: "Confort del Hogar",
  industry_commerce_and_business: "Industria y Comercio",
  air_conditioning: "Aire Acondicionado",
  fashion_childrens_clothes: "Ropa Infantil",
  fashion_shoes: "Calzado",
  fashion_sport: "Ropa Deportiva",
  fashion_underwear_beach: "Ropa Interior y Playa",
  fashion_male_clothing: "Ropa Masculina",
  fashion_bags_accessories: "Bolsos y Accesorios",
  fashion_female_clothing: "Ropa Femenina",
  fashion: "Moda",
  small_appliances: "Pequeños Electrodomésticos",
  small_appliances_home_oven_and_coffee: "Electrodomésticos de Cocina",
  security_and_services: "Seguridad y Servicios",
  baby: "Bebé",
  books_technical: "Libros Técnicos",
  cine_photo: "Cámaras y Fotografía",
  market_place: "Market Place",
  party_supplies: "Suministros para Fiestas",
  beach_toy: "Juguetes de Playa",
  costruction_tools: "Herramientas de Construcción",
  drivers: "Conductores",
  fashion_handbags: "Bolsos",
  grooming: "Cuidado Personal",
  hygiene: "Higiene",
  kitchen: "Cocina",
  la_cuisine: "Cocina",
  luggage_accessories: "Maletas y Accesorios",
  musical_instruments: "Instrumentos Musicales",
  office: "Oficina",
  other: "Otros",
  padaria: "Panadería",
  portateis: "Portátiles",
  portable: "Portátiles",
  home_appliance: "Electrodomésticos",
};

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
