import { Card } from "@/components/ui";
import type { KpiSummaryResponse } from "@/types";
import styles from "@/styles/dashboard/KpiGrid.module.css";

interface KpiGridProps {
  data: KpiSummaryResponse;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

interface KpiCardConfig {
  label: string;
  value: string;
  subtext?: string;
  variant: "positive" | "negative" | "neutral";
}

const VARIANT_CLASS: Record<string, string> = {
  positive: styles.kpiPositive,
  negative: styles.kpiNegative,
  neutral: styles.kpiNeutral,
};

export function KpiGrid({ data }: KpiGridProps) {
  const cards: KpiCardConfig[] = [
    { label: "GMV", value: formatCurrency(data.gmv), subtext: "Volumen bruto", variant: "positive" },
    { label: "Revenue", value: formatCurrency(data.revenue), subtext: "Ingreso total", variant: "positive" },
    { label: "Pedidos", value: formatNumber(data.totalOrders), subtext: "Total de pedidos", variant: "neutral" },
    { label: "AOV", value: formatCurrency(data.averageOrderValue), subtext: "Valor promedio", variant: "positive" },
    { label: "IPO", value: data.itemsPerOrder.toFixed(2), subtext: "Ítems por pedido", variant: "neutral" },
    { label: "Cancelación", value: formatPercent(data.cancellationRate), subtext: "Tasa de cancelación", variant: "negative" },
    { label: "On-Time", value: formatPercent(data.onTimeRate), subtext: "Entregas a tiempo", variant: "positive" },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={`${styles.kpiCard} ${VARIANT_CLASS[card.variant]}`}>
          <Card>
            <div className={styles.kpiValue}>{card.value}</div>
            <div className={styles.kpiLabel}>{card.label}</div>
            {card.subtext && <div className={styles.kpiSubtext}>{card.subtext}</div>}
          </Card>
        </div>
      ))}
    </div>
  );
}
