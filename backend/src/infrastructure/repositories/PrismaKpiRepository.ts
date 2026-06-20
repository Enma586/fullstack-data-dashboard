import { Prisma } from '@prisma/client';
import { prisma } from '../database/prismaClient';
import {
  IKpiRepository,
  KpiFilters,
  TrendFilters,
  TopProductFilters,
} from '../../domain/ports/IKpiRepository';
import { KpiSummary } from '../../domain/entities/KpiSummary';
import { RevenueTrend } from '../../domain/entities/RevenueTrend';
import { ProductRanking } from '../../domain/entities/ProductRanking';

type RawRow<T> = T extends Date
  ? { period: Date; revenue: string; order_count: bigint }
  : never;

export class PrismaKpiRepository implements IKpiRepository {
  private joinClause(): string {
    return 'LEFT JOIN gold.dim_customer dc ON fs.customer_sk = dc.customer_sk';
  }

  private whereConditions(
    filters: KpiFilters,
  ): { sql: string; params: (string | Date)[] } {
    const conditions: string[] = [];
    const params: (string | Date)[] = [];
    let idx = 1;

    if (filters.from) {
      conditions.push(`fs.order_purchase_timestamp >= $${idx}::TIMESTAMP`);
      params.push(filters.from);
      idx++;
    }
    if (filters.to) {
      conditions.push(`fs.order_purchase_timestamp < $${idx}::TIMESTAMP`);
      params.push(filters.to);
      idx++;
    }
    if (filters.customerState) {
      conditions.push(`dc.customer_state = $${idx}`);
      params.push(filters.customerState);
      idx++;
    }
    if (filters.paymentType) {
      conditions.push(`fs.payment_type = $${idx}`);
      params.push(filters.paymentType);
      idx++;
    }

    return { sql: conditions.join(' AND '), params };
  }

  private whereAndJoin(
    filters: KpiFilters,
  ): { sql: string; params: (string | Date)[] } {
    const w = this.whereConditions(filters);
    const join = this.joinClause();
    if (w.params.length === 0) return { sql: join, params: [] };
    return { sql: `${join} WHERE ${w.sql}`, params: w.params };
  }

  async getKpis(filters: KpiFilters): Promise<KpiSummary> {
    const wj = this.whereAndJoin(filters);

    const mainRow: Array<{
      total_revenue: string;
      total_orders: bigint;
      cancelled_orders: bigint;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        COALESCE(SUM(fs.payment_value_allocated), 0) AS total_revenue,
        COUNT(DISTINCT fs.order_id) AS total_orders,
        COUNT(DISTINCT CASE WHEN fs.order_status = 'canceled' THEN fs.order_id END) AS cancelled_orders
      FROM gold.fact_sales fs
      ${wj.sql}
    `,
      ...wj.params,
    );

    const totalRevenue = Number(mainRow[0].total_revenue);
    const totalOrders = Number(mainRow[0].total_orders);
    const cancelledOrders = Number(mainRow[0].cancelled_orders);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const cancellationRate =
      totalOrders > 0 ? cancelledOrders / totalOrders : 0;

    const byState: Array<{ state: string; order_count: bigint }> =
      await prisma.$queryRawUnsafe(
        `
        SELECT
          dc.customer_state AS state,
          COUNT(DISTINCT fs.order_id) AS order_count
        FROM gold.fact_sales fs
        ${wj.sql}
        GROUP BY dc.customer_state
        ORDER BY order_count DESC
      `,
        ...wj.params,
      );

    const byPaymentType: Array<{
      payment_type: string;
      order_count: bigint;
      revenue: string;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        fs.payment_type,
        COUNT(DISTINCT fs.order_id) AS order_count,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue
      FROM gold.fact_sales fs
      ${wj.sql}
      GROUP BY fs.payment_type
      ORDER BY revenue DESC
    `,
      ...wj.params,
    );

    const topCategories: Array<{
      category: string;
      order_count: bigint;
      revenue: string;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        COALESCE(dp.product_category_name_english, 'Sin categoria') AS category,
        COUNT(DISTINCT fs.order_id) AS order_count,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue
      FROM gold.fact_sales fs
      LEFT JOIN gold.dim_product dp ON fs.product_sk = dp.product_sk
      ${wj.sql}
      GROUP BY dp.product_category_name_english
      ORDER BY revenue DESC
      LIMIT 10
    `,
      ...wj.params,
    );

    return new KpiSummary(
      totalRevenue,
      totalOrders,
      Math.round(averageOrderValue * 100) / 100,
      cancelledOrders,
      Math.round(cancellationRate * 10000) / 10000,
      byState.map((r) => ({
        state: r.state ?? 'N/A',
        orderCount: Number(r.order_count),
      })),
      byPaymentType.map((r) => ({
        paymentType: r.payment_type,
        orderCount: Number(r.order_count),
        revenue: Number(r.revenue),
      })),
      topCategories.map((r) => ({
        category: r.category,
        orderCount: Number(r.order_count),
        revenue: Number(r.revenue),
      })),
    );
  }

  async getRevenueTrend(filters: TrendFilters): Promise<RevenueTrend[]> {
    const wj = this.whereAndJoin(filters);
    const trunc = filters.grain === 'week' ? 'week' : 'day';

    const rows: Array<{
      period: Date;
      revenue: string;
      order_count: bigint;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        DATE_TRUNC('${trunc}', fs.order_purchase_timestamp) AS period,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue,
        COUNT(DISTINCT fs.order_id) AS order_count
      FROM gold.fact_sales fs
      ${wj.sql}
      GROUP BY period
      ORDER BY period ASC
    `,
      ...wj.params,
    );

    return rows.map(
      (r) =>
        new RevenueTrend(
          r.period.toISOString().slice(0, 10),
          Number(r.revenue),
          Number(r.order_count),
        ),
    );
  }

  async getTopProducts(filters: TopProductFilters): Promise<ProductRanking[]> {
    const wj = this.whereAndJoin(filters);
    const limit = filters.limit ?? 10;

    const rows: Array<{
      product_id: string;
      category: string;
      total_sold: bigint;
      revenue: string;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        dp.product_id,
        COALESCE(dp.product_category_name_english, 'Sin categoria') AS category,
        COUNT(DISTINCT fs.order_id) AS total_sold,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue
      FROM gold.fact_sales fs
      LEFT JOIN gold.dim_product dp ON fs.product_sk = dp.product_sk
      ${wj.sql}
      GROUP BY dp.product_id, dp.product_category_name_english
      ORDER BY revenue DESC
      LIMIT ${limit}
    `,
      ...wj.params,
    );

    return rows.map(
      (r) =>
        new ProductRanking(
          r.product_id,
          r.category,
          Number(r.total_sold),
          Number(r.revenue),
        ),
    );
  }
}
