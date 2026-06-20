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

type RawScalar = string | number | boolean | Date;

export class PrismaKpiRepository implements IKpiRepository {
  private joinedFrom(): string {
    return [
      'FROM gold.fact_sales fs',
      'LEFT JOIN gold.dim_customer dc ON fs.customer_sk = dc.customer_sk',
      'LEFT JOIN gold.dim_product dp ON fs.product_sk = dp.product_sk',
    ].join(' ');
  }

  private whereConditions(
    filters: KpiFilters,
  ): { clause: string; params: RawScalar[] } {
    const conditions: string[] = [];
    const params: RawScalar[] = [];
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
    if (filters.orderStatus) {
      conditions.push(`fs.order_status = $${idx}`);
      params.push(filters.orderStatus);
      idx++;
    }
    if (filters.category) {
      conditions.push(`dp.product_category_name_english = $${idx}`);
      params.push(filters.category);
      idx++;
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params,
    };
  }

  private whereAndJoin(
    filters: KpiFilters,
  ): { clause: string; params: RawScalar[] } {
    const w = this.whereConditions(filters);
    const from = this.joinedFrom();
    return { clause: `${from} ${w.clause}`, params: w.params };
  }

  async getKpis(filters: KpiFilters): Promise<KpiSummary> {
    const wj = this.whereAndJoin(filters);

    const mainRow: Array<{
      gmv: string;
      revenue: string;
      total_orders: bigint;
      total_items: bigint;
      cancelled_orders: bigint;
      delivered_orders: bigint;
      on_time_orders: bigint;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        COALESCE(SUM(fs.gmv), 0) AS gmv,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue,
        COUNT(DISTINCT fs.order_id) AS total_orders,
        COUNT(*) AS total_items,
        COUNT(DISTINCT CASE WHEN fs.is_canceled = TRUE THEN fs.order_id END) AS cancelled_orders,
        COUNT(DISTINCT CASE WHEN fs.is_delivered = TRUE THEN fs.order_id END) AS delivered_orders,
        COUNT(DISTINCT CASE WHEN fs.is_on_time = TRUE THEN fs.order_id END) AS on_time_orders
      ${wj.clause}
    `,
      ...wj.params,
    );

    const gmv = Number(mainRow[0].gmv);
    const revenue = Number(mainRow[0].revenue);
    const totalOrders = Number(mainRow[0].total_orders);
    const totalItems = Number(mainRow[0].total_items);
    const cancelledOrders = Number(mainRow[0].cancelled_orders);
    const deliveredOrders = Number(mainRow[0].delivered_orders);
    const onTimeOrders = Number(mainRow[0].on_time_orders);

    const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;
    const itemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;
    const cancellationRate = totalOrders > 0 ? cancelledOrders / totalOrders : 0;
    const onTimeRate = deliveredOrders > 0 ? onTimeOrders / deliveredOrders : 0;

    const byState: Array<{ state: string; order_count: bigint }> =
      await prisma.$queryRawUnsafe(
        `
        SELECT
          dc.customer_state AS state,
          COUNT(DISTINCT fs.order_id) AS order_count
        ${wj.clause}
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
        ${wj.clause}
        GROUP BY fs.payment_type
        ORDER BY revenue DESC
    `,
      ...wj.params,
    );

    const topByGmv: Array<{
      product_id: string;
      category: string;
      total_sold: bigint;
      gmv: string;
      revenue: string;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        dp.product_id,
        COALESCE(dp.product_category_name_english, 'Sin categoria') AS category,
        COUNT(DISTINCT fs.order_id) AS total_sold,
        COALESCE(SUM(fs.gmv), 0) AS gmv,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue
      ${wj.clause}
      GROUP BY dp.product_id, dp.product_category_name_english
      ORDER BY gmv DESC
      LIMIT 10
    `,
      ...wj.params,
    );

    const topByRevenue: Array<{
      product_id: string;
      category: string;
      total_sold: bigint;
      gmv: string;
      revenue: string;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        dp.product_id,
        COALESCE(dp.product_category_name_english, 'Sin categoria') AS category,
        COUNT(DISTINCT fs.order_id) AS total_sold,
        COALESCE(SUM(fs.gmv), 0) AS gmv,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue
      ${wj.clause}
      GROUP BY dp.product_id, dp.product_category_name_english
      ORDER BY revenue DESC
      LIMIT 10
    `,
      ...wj.params,
    );

    const mapProduct = (r: typeof topByGmv[0]) => ({
      productId: r.product_id,
      productCategory: r.category,
      totalSold: Number(r.total_sold),
      gmv: Number(r.gmv),
      revenue: Number(r.revenue),
    });

    return new KpiSummary(
      gmv,
      revenue,
      totalOrders,
      Math.round(averageOrderValue * 100) / 100,
      Math.round(itemsPerOrder * 100) / 100,
      cancelledOrders,
      Math.round(cancellationRate * 10000) / 10000,
      Math.round(onTimeRate * 10000) / 10000,
      byState.map((r) => ({ state: r.state ?? 'N/A', orderCount: Number(r.order_count) })),
      byPaymentType.map((r) => ({
        paymentType: r.payment_type,
        orderCount: Number(r.order_count),
        revenue: Number(r.revenue),
      })),
      topByGmv.map(mapProduct),
      topByRevenue.map(mapProduct),
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
      ${wj.clause}
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
    const metric = filters.metric === 'gmv' ? 'fs.gmv' : 'fs.payment_value_allocated';
    const metricAlias = filters.metric === 'gmv' ? 'gmv' : 'revenue';

    const rows: Array<{
      product_id: string;
      category: string;
      total_sold: bigint;
      gmv: string;
      revenue: string;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        dp.product_id,
        COALESCE(dp.product_category_name_english, 'Sin categoria') AS category,
        COUNT(DISTINCT fs.order_id) AS total_sold,
        COALESCE(SUM(fs.gmv), 0) AS gmv,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue
      ${wj.clause}
      GROUP BY dp.product_id, dp.product_category_name_english
      ORDER BY ${metricAlias === 'gmv' ? 'gmv' : 'revenue'} DESC
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
          Number(r.gmv),
          Number(r.revenue),
        ),
    );
  }
}
