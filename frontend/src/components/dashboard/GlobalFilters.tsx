"use client";

import { useFilters } from "@/context/FilterContext";
import { DatePicker, Select } from "@/components/ui";
import styles from "./GlobalFilters.module.css";

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

const PAYMENT_OPTIONS = [
  { value: "credit_card", label: "Tarjeta de Crédito" },
  { value: "boleto", label: "Boleto" },
  { value: "voucher", label: "Voucher" },
  { value: "debit_card", label: "Tarjeta de Débito" },
];

export function GlobalFilters() {
  const {
    filters,
    setDateFrom,
    setDateTo,
    setCustomerState,
    setPaymentType,
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
          label="Estado"
          options={STATE_OPTIONS}
          value={filters.customerState}
          onChange={setCustomerState}
          placeholder="Todos los estados"
        />
      </div>

      <div className={styles.filterItem}>
        <Select
          label="Tipo de Pago"
          options={PAYMENT_OPTIONS}
          value={filters.paymentType}
          onChange={setPaymentType}
          placeholder="Todos los pagos"
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
