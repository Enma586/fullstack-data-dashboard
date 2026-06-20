import { Card } from "@/components/ui";
import type { KpiSummaryResponse } from "@/types";
import styles from "./KpiGrid.module.css";

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
  colorClass: string;
}

export function KpiGrid({ data }: KpiGridProps) {
  const cards: KpiCardConfig[] = [
    {
      label: "GMV",
      value: formatCurrency(data.gmv),
      subtext: "Volumen bruto (item_price)",
      colorClass: styles.kpiPositive,
    },
    {
      label: "Revenue",
      value: formatCurrency(data.revenue),
      subtext: "Ingreso total (payment_value)",
      colorClass: styles.kpiPositive,
    },
    {
      label: "Pedidos",
      value: formatNumber(data.totalOrders),
      subtext: "Total de pedidos",
      colorClass: styles.kpiNeutral,
    },
    {
      label: "AOV",
      value: formatCurrency(data.averageOrderValue),
      subtext: "Valor promedio por pedido",
      colorClass: styles.kpiPositive,
    },
    {
      label: "IPO",
      value: data.itemsPerOrder.toFixed(2),
      subtext: "Ítems por pedido",
      colorClass: styles.kpiNeutral,
    },
    {
      label: "Cancelación",
      value: formatPercent(data.cancellationRate),
      subtext: "Tasa de cancelación",
      colorClass: styles.kpiNegative,
    },
    {
      label: "On-Time",
      value: formatPercent(data.onTimeRate),
      subtext: "Entregas a tiempo",
      colorClass: styles.kpiPositive,
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <Card key={card.label}>
          <div className={card.colorClass}>
            <div className={styles.kpiValue}>{card.value}</div>
          </div>
          <div className={styles.kpiSubtext}>{card.label}</div>
          {card.subtext && <div className={styles.kpiSubtext}>{card.subtext}</div>}
        </Card>
      ))}
    </div>
  );
}
