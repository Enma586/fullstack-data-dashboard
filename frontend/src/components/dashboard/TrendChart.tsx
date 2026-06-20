"use client";

import { useState, useMemo, useCallback, useEffect, type MouseEvent } from "react";
import { Card } from "@/components/ui";
import type { RevenueTrendItem } from "@/types";
import styles from "@/styles/dashboard/TrendChart.module.css";

const PADDING = { top: 20, right: 16, bottom: 40, left: 52 };

interface TrendChartProps {
  data: RevenueTrendItem[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 0 }).format(value);
}

interface TooltipState {
  x: number; y: number; item: RevenueTrendItem;
}

function useChartDims() {
  const [dims, setDims] = useState({ w: 800, h: 280 });
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      setDims({ w: Math.max(400, Math.min(800, vw - 48)), h: 260 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return dims;
}

export function TrendChart({ data }: TrendChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const { w, h } = useChartDims();

  const cw = w;
  const ch = h;
  const pw = cw - PADDING.left - PADDING.right;
  const ph = ch - PADDING.top - PADDING.bottom;

  const { yMaxRevenue, yMaxOrders, xScale, yScaleRevenue, yScaleOrders, lineRevenue, lineOrders } =
    useMemo(() => {
      const maxR = Math.max(...data.map((d) => d.revenue), 1);
      const maxO = Math.max(...data.map((d) => d.orderCount), 1);
      const yR = (v: number) => PADDING.top + ph - (v / maxR) * ph;
      const yO = (v: number) => PADDING.top + ph - (v / maxO) * ph;
      const xS = (i: number) => PADDING.left + (i / Math.max(data.length - 1, 1)) * pw;
      return {
        yMaxRevenue: maxR, yMaxOrders: maxO,
        xScale: xS, yScaleRevenue: yR, yScaleOrders: yO,
        lineRevenue: data.map((d, i) => `${xS(i)},${yR(d.revenue)}`).join(" "),
        lineOrders: data.map((d, i) => `${xS(i)},${yO(d.orderCount)}`).join(" "),
      };
    }, [data, pw, ph]);

  const yTicks = useMemo(() => {
    const t: number[] = [];
    for (let i = 0; i <= 4; i++) t.push(Math.round((yMaxRevenue / 4) * i));
    return t;
  }, [yMaxRevenue]);

  const xLabels = useMemo(() => {
    if (data.length <= 1) return [];
    const n = cw < 600 ? 4 : 6;
    const step = Math.max(1, Math.floor((data.length - 1) / (n - 1)));
    const idx: number[] = [];
    for (let i = 0; i < data.length && idx.length < n; i += step) idx.push(i);
    if (idx[idx.length - 1] !== data.length - 1) idx.push(data.length - 1);
    return idx.map((i) => ({ label: data[i].period.slice(0, 4), x: xScale(i) }));
  }, [data, xScale, cw]);

  const handleMouseMove = useCallback((e: MouseEvent<SVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * cw;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < data.length; i++) {
      const d = Math.abs(xScale(i) - mx);
      if (d < bestD) { bestD = d; best = i; }
    }
    const item = data[best];
    setTooltip({ x: xScale(best), y: yScaleRevenue(item.revenue), item });
  }, [data, xScale, yScaleRevenue, cw]);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  if (data.length === 0) {
    return (
      <Card title="Tendencia">
        <div className={styles.emptyChart}>Sin datos de tendencia</div>
      </Card>
    );
  }

  const ttipX = tooltip ? Math.min(tooltip.x + 10, cw - 175) : 0;
  const ttipY = tooltip ? Math.max(tooltip.y - 36, 4) : 0;

  return (
    <Card title="Tendencia (Revenue y Pedidos)">
      <div className={styles.wrapper}>
        <svg viewBox={`0 0 ${cw} ${ch}`} className={styles.svg}
          onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
          style={{ maxHeight: ch + 20 }}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d65e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22d65e" stopOpacity="0" />
            </linearGradient>
            <filter id="glowRev">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glowOrd">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {yTicks.map((v) => {
            const y = PADDING.top + ph - (v / yMaxRevenue) * ph;
            return (
              <g key={v}>
                <line x1={PADDING.left} y1={y} x2={cw - PADDING.right} y2={y}
                  stroke="rgba(168, 85, 247, 0.08)" strokeWidth={1} />
                <text x={PADDING.left - 6} y={y + 3} textAnchor="end"
                  fill="var(--color-text-muted)" fontSize={10}>{formatCurrency(v)}</text>
              </g>
            );
          })}

          {xLabels.map(({ label, x }) => (
            <text key={`${x}`} x={x} y={ch - PADDING.bottom + 16} textAnchor="middle"
              fill="var(--color-text-muted)" fontSize={11} fontWeight={600}>
              {label}
            </text>
          ))}

          <polygon points={lineRevenue} fill="url(#revGrad)" />
          <polygon points={lineOrders} fill="url(#ordGrad)" />

          <polyline points={lineRevenue} fill="none" stroke="#a855f7" strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" filter="url(#glowRev)" />
          <polyline points={lineOrders} fill="none" stroke="#22d65e" strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" filter="url(#glowOrd)" />

          {tooltip && (
            <g>
              <line x1={tooltip.x} y1={PADDING.top} x2={tooltip.x}
                y2={PADDING.top + ph} stroke="rgba(168,85,247,0.3)" strokeWidth={1} strokeDasharray="3 3" />
              <rect x={ttipX} y={ttipY} width={170} height={48} rx={8}
                fill="rgba(15,19,32,0.92)" stroke="rgba(168,85,247,0.3)" strokeWidth={1} />
              <text x={ttipX + 12} y={ttipY + 16} fill="#edf0f7" fontSize={11} fontWeight={600}>
                {tooltip.item.period}
              </text>
              <text x={ttipX + 12} y={ttipY + 30} fill="#a855f7" fontSize={11}>
                Revenue: {formatCurrency(tooltip.item.revenue)}
              </text>
              <text x={ttipX + 12} y={ttipY + 42} fill="#22d65e" fontSize={11}>
                Pedidos: {formatNumber(tooltip.item.orderCount)}
              </text>
            </g>
          )}
        </svg>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "#a855f7", boxShadow: "0 0 8px #a855f7" }} />
            Revenue
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "#22d65e", boxShadow: "0 0 8px #22d65e" }} />
            Pedidos
          </div>
        </div>
      </div>
    </Card>
  );
}
