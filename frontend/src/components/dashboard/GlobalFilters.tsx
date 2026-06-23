/**
 * GlobalFilters — Barra de filtros globales del dashboard.
 * Permite filtrar por rango de fechas, estado del cliente, status de orden y categoría.
 * Los cambios se reflejan en toda la aplicación a través de FilterContext.
 */
"use client";

import { useFilters } from "@/context/FilterContext";
import { DatePicker, Select } from "@/components/ui";
import styles from "@/styles/dashboard/GlobalFilters.module.css";

const STATE_OPTIONS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "delivered", label: "Entregado" },
  { value: "shipped", label: "Enviado" },
  { value: "processing", label: "Procesando" },
  { value: "canceled", label: "Cancelado" },
  { value: "invoiced", label: "Facturado" },
  { value: "unavailable", label: "No disponible" },
  { value: "approved", label: "Aprobado" },
  { value: "created", label: "Creado" },
];

const CATEGORY_OPTIONS = [
  { value: "bed_bath_table", label: "Cama, Mesa e Baño" },
  { value: "health_beauty", label: "Salud y Belleza" },
  { value: "sports_leisure", label: "Deportes y Ocio" },
  { value: "furniture_decor", label: "Muebles y Decoración" },
  { value: "housewares", label: "Utensilios Domésticos" },
  { value: "informatica_accessories", label: "Informática y Accesorios" },
  { value: "watches_gifts", label: "Relojes y Regalos" },
  { value: "telephony", label: "Telefonía" },
  { value: "garden_tools", label: "Jardín y Herramientas" },
  { value: "auto", label: "Automotriz" },
];

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
          placeholder="Todos los status"
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
