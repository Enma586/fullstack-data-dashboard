/**
 * types/index.ts — Interfaces de TypeScript para la API de Olist Dashboard.
 * Define los contratos de datos entre el frontend y el backend:
 * - FilterParams: parámetros de consulta HTTP
 * - KpiSummaryResponse: respuesta de GET /kpis
 * - RevenueTrendItem / RevenueTrendResponse: respuesta de GET /trend/revenue
 * - ProductRankingItem / ProductRankingResponse: respuesta de GET /rankings/products
 * - GlobalFilters: estado interno de los filtros en el contexto
 */

// ─── Filtros ────────────────────────────────────────────────────────────────

export interface FilterParams {
  from?: string;
  to?: string;
  customer_state?: string;
  order_status?: string;
  category?: string;
  metric?: "gmv" | "revenue";
  limit?: number;
}

export interface TrendFilterParams extends FilterParams {
  grain?: "day" | "week";
}

// ─── KPI Summary (GET /kpis) ───────────────────────────────────────────────

export interface StateOrderSummary {
  state: string;
  orderCount: number;
}

export interface PaymentTypeSummary {
  paymentType: string;
  orderCount: number;
  revenue: number;
}

export interface CategorySummary {
  category: string;
  orderCount: number;
  revenue: number;
}

export interface KpiSummaryResponse {
  gmv: number;
  revenue: number;
  totalOrders: number;
  averageOrderValue: number;
  itemsPerOrder: number;
  cancelledOrders: number;
  cancellationRate: number;
  onTimeRate: number;
  ordersByState: StateOrderSummary[];
  ordersByPaymentType: PaymentTypeSummary[];
  topProductsByGmv: ProductRankingEntry[];
  topProductsByRevenue: ProductRankingEntry[];
}

// ─── Revenue Trend (GET /trend/revenue) ─────────────────────────────────────

export interface RevenueTrendItem {
  period: string;
  revenue: number;
  orderCount: number;
}

export type RevenueTrendResponse = RevenueTrendItem[];

// ─── Product Ranking Entry (anidado en /kpis) ───────────────────────────────

export interface ProductRankingEntry {
  productId: string;
  productCategory: string;
  totalSold: number;
  gmv: number;
  revenue: number;
}

// ─── Top Products (GET /rankings/products) ──────────────────────────────────

export interface ProductRankingItem {
  productId: string;
  productCategory: string;
  totalSold: number;
  gmv: number;
  revenue: number;
}

export type ProductRankingResponse = ProductRankingItem[];

// ─── Error ──────────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  error: string;
}

// ─── Filtros globales de la UI ──────────────────────────────────────────────

export interface GlobalFilters {
  dateFrom: string;
  dateTo: string;
  customerState: string;
  orderStatus: string;
  category: string;
}
