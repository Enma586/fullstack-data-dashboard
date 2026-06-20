import { KpiSummary } from '../entities/KpiSummary';
import { RevenueTrend } from '../entities/RevenueTrend';
import { ProductRanking } from '../entities/ProductRanking';

export interface KpiFilters {
  from?: Date;
  to?: Date;
  customerState?: string;
  paymentType?: string;
}

export interface TrendFilters extends KpiFilters {
  grain: 'day' | 'week';
}

export interface TopProductFilters extends KpiFilters {
  limit?: number;
}

export interface IKpiRepository {
  getKpis(filters: KpiFilters): Promise<KpiSummary>;
  getRevenueTrend(filters: TrendFilters): Promise<RevenueTrend[]>;
  getTopProducts(filters: TopProductFilters): Promise<ProductRanking[]>;
}
