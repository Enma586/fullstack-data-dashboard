/* =============================================================================
   types/index.ts — Interfaces de TypeScript para la API de Olist Dashboard
   ============================================================================= */

// ─── Filtros ────────────────────────────────────────────────────────────────

export interface FilterParams {
  from?: string;
  to?: string;
  customer_state?: string;
  payment_type?: string;
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
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  cancelledOrders: number;
  cancellationRate: number;
  ordersByState: StateOrderSummary[];
  ordersByPaymentType: PaymentTypeSummary[];
  topCategories: CategorySummary[];
}

// ─── Revenue Trend (GET /trend/revenue) ─────────────────────────────────────

export interface RevenueTrendItem {
  period: string;
  revenue: number;
  orderCount: number;
}

export type RevenueTrendResponse = RevenueTrendItem[];

// ─── Top Products (futuro: GET /top-products) ───────────────────────────────

export interface ProductRankingItem {
  productId: string;
  productCategory: string;
  totalSold: number;
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
  paymentType: string;
}
