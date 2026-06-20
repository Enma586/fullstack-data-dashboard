"use client";

import { useState, useMemo, useCallback, type MouseEvent } from "react";
import { Card } from "@/components/ui";
import type { RevenueTrendItem } from "@/types";
import styles from "./TrendChart.module.css";

const CHART_WIDTH = 800;
const CHART_HEIGHT = 320;
const PADDING = { top: 24, right: 24, bottom: 48, left: 64 };
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

interface TrendChartProps {
  data: RevenueTrendItem[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

interface TooltipState {
  x: number;
  y: number;
  item: RevenueTrendItem;
}

export function TrendChart({ data }: TrendChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { yMaxRevenue, yMaxOrders, xScale, yScaleRevenue, yScaleOrders, lineRevenue, lineOrders } =
    useMemo(() => {
      const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
      const maxOrders = Math.max(...data.map((d) => d.orderCount), 1);

      const yRev = (v: number) =>
        PADDING.top + PLOT_HEIGHT - (v / maxRevenue) * PLOT_HEIGHT;
      const yOrd = (v: number) =>
        PADDING.top + PLOT_HEIGHT - (v / maxOrders) * PLOT_HEIGHT;

      const xScaleFn = (i: number) =>
        PADDING.left + (i / Math.max(data.length - 1, 1)) * PLOT_WIDTH;

      const revPoints = data.map((d, i) => `${xScaleFn(i)},${yRev(d.revenue)}`).join(" ");
      const ordPoints = data.map((d, i) => `${xScaleFn(i)},${yOrd(d.orderCount)}`).join(" ");

      return {
        yMaxRevenue: maxRevenue,
        yMaxOrders: maxOrders,
        xScale: xScaleFn,
        yScaleRevenue: yRev,
        yScaleOrders: yOrd,
        lineRevenue: revPoints,
        lineOrders: ordPoints,
      };
    }, [data]);

  const yTicksRevenue = useMemo(() => {
    const ticks: number[] = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      ticks.push(Math.round((yMaxRevenue / steps) * i));
    }
    return ticks;
  }, [yMaxRevenue]);

  const xLabels = useMemo(() => {
    if (data.length <= 1) return [];
    const maxLabels = 6;
    const step = Math.max(1, Math.floor((data.length - 1) / (maxLabels - 1)));
    const indices: number[] = [];
    for (let i = 0; i < data.length; i += step) {
      if (indices.length < maxLabels) {
        indices.push(i);
      }
    }
    if (indices[indices.length - 1] !== data.length - 1) {
      indices.push(data.length - 1);
    }
    return indices.map((i) => ({
      index: i,
      label: data[i].period.slice(0, 4),
      x: xScale(i),
    }));
  }, [data, xScale]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<SVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;

      let closestIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < data.length; i++) {
        const d = Math.abs(xScale(i) - mouseX);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      }

      const item = data[closestIdx];
      const cx = xScale(closestIdx);
      const cy = yScaleRevenue(item.revenue);

      setTooltip({ x: cx, y: cy, item });
    },
    [data, xScale, yScaleRevenue],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  if (data.length === 0) {
    return (
      <Card title="Tendencia">
        <div className={styles.emptyChart}>Sin datos de tendencia disponibles</div>
      </Card>
    );
  }

  return (
    <Card title="Tendencia (Revenue y Pedidos)">
      <div className={styles.wrapper}>
        <div className={styles.chartContainer}>
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className={styles.svg}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {yTicksRevenue.map((v) => {
              const y = PADDING.top + PLOT_HEIGHT - (v / yMaxRevenue) * PLOT_HEIGHT;
              return (
                <g key={v}>
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={CHART_WIDTH - PADDING.right}
                    y2={y}
                    stroke="var(--color-border)"
                    strokeWidth={1}
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="var(--color-text-muted)"
                    fontSize={11}
                  >
                    {formatCurrency(v)}
                  </text>
                </g>
              );
            })}

            {xLabels.map(({ label, x }) => (
              <text
                key={`${x}-${label}`}
                x={x}
                y={CHART_HEIGHT - PADDING.bottom + 20}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={12}
                fontWeight={600}
              >
                {label}
              </text>
            ))}

            <polyline
              points={lineRevenue}
              fill="none"
              stroke="var(--color-primary-500)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <polyline
              points={lineOrders}
              fill="none"
              stroke="var(--color-secondary-500)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {tooltip && (
              <g>
                <line
                  x1={tooltip.x}
                  y1={PADDING.top}
                  x2={tooltip.x}
                  y2={PADDING.top + PLOT_HEIGHT}
                  stroke="var(--color-text-muted)"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                />
                <circle
                  cx={tooltip.x}
                  cy={tooltip.y}
                  r={4}
                  fill="var(--color-primary-500)"
                  stroke="var(--color-bg-primary)"
                  strokeWidth={2}
                />
                <rect
                  x={Math.min(tooltip.x + 12, CHART_WIDTH - 180)}
                  y={Math.max(tooltip.y - 36, 4)}
                  width={170}
                  height={52}
                  rx={6}
                  fill="var(--color-bg-elevated)"
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
                <text
                  x={Math.min(tooltip.x + 20, CHART_WIDTH - 172)}
                  y={Math.max(tooltip.y - 18, 10)}
                  fill="var(--color-text-primary)"
                  fontSize={11}
                  fontWeight={600}
                >
                  {tooltip.item.period}
                </text>
                <text
                  x={Math.min(tooltip.x + 20, CHART_WIDTH - 172)}
                  y={Math.max(tooltip.y - 3, 24)}
                  fill="var(--color-primary-400)"
                  fontSize={11}
                >
                  Revenue: {formatCurrency(tooltip.item.revenue)}
                </text>
                <text
                  x={Math.min(tooltip.x + 20, CHART_WIDTH - 172)}
                  y={Math.max(tooltip.y + 11, 38)}
                  fill="var(--color-secondary-400)"
                  fontSize={11}
                >
                  Pedidos: {formatNumber(tooltip.item.orderCount)}
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div
              className={styles.legendDot}
              style={{ backgroundColor: "var(--color-primary-500)" }}
            />
            Revenue
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendDot}
              style={{ backgroundColor: "var(--color-secondary-500)" }}
            />
            Pedidos
          </div>
        </div>
      </div>
    </Card>
  );
}
