/**
 * GlobalFilters — Barra de filtros globales del dashboard.
 * Permite filtrar por rango de fechas, estado del cliente, status de orden y categoría.
 * Los cambios se reflejan en toda la aplicación a través de FilterContext.
 */
"use client";

import { useFilters } from "@/context/FilterContext";
import { DatePicker, Select } from "@/components/ui";
import { STATE_OPTIONS, ORDER_STATUS_OPTIONS, CATEGORY_OPTIONS } from "@/constants";
import styles from "@/styles/dashboard/GlobalFilters.module.css";

export function GlobalFilters() {
  const {
    filters,
    setDateFrom,
    setDateTo,
    setCustomerState,
    setOrderStatus,
    setCategory,
    resetFilters,
  } = useFilters();

  return (
    <div className={styles.bar}>
      <div className={styles.filterItem}>
        <DatePicker
          label="Desde"
          value={filters.dateFrom}
          onChange={setDateFrom}
        />
      </div>

      <div className={styles.filterItem}>
        <DatePicker
          label="Hasta"
          value={filters.dateTo}
          onChange={setDateTo}
        />
      </div>

      <div className={styles.filterItem}>
        <Select
          label="Estado del Cliente"
          options={STATE_OPTIONS}
          value={filters.customerState}
          onChange={setCustomerState}
          placeholder="Todos los estados"
        />
      </div>

      <div className={styles.filterItem}>
        <Select
          label="Estado de Orden"
          options={ORDER_STATUS_OPTIONS}
          value={filters.orderStatus}
          onChange={setOrderStatus}
          placeholder="Todos los estados"
        />
      </div>

      <div className={styles.filterItem}>
        <Select
          label="Categoría"
          options={CATEGORY_OPTIONS}
          value={filters.category}
          onChange={setCategory}
          placeholder="Todas las categorías"
        />
      </div>

      <button
        className={styles.resetButton}
        onClick={resetFilters}
        type="button"
      >
        Restablecer
      </button>
    </div>
  );
}
