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
      label: "Ingresos",
      value: formatCurrency(data.totalRevenue),
      subtext: "Revenue total del período",
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
      label: "Cancelados",
      value: formatNumber(data.cancelledOrders),
      subtext: "Pedidos cancelados",
      colorClass: styles.kpiNegative,
    },
    {
      label: "Tasa de Cancelación",
      value: formatPercent(data.cancellationRate),
      subtext: "Proporción sobre el total",
      colorClass: styles.kpiNegative,
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
