export interface StateOrderSummary {
  state: string;
  orderCount: number;
}

export interface PaymentTypeSummary {
  paymentType: string;
  orderCount: number;
  revenue: number;
}

export interface ProductRankingEntry {
  productId: string;
  productCategory: string;
  totalSold: number;
  gmv: number;
  revenue: number;
}

export class KpiSummary {
  constructor(
    public readonly gmv: number,
    public readonly revenue: number,
    public readonly totalOrders: number,
    public readonly averageOrderValue: number,
    public readonly itemsPerOrder: number,
    public readonly cancelledOrders: number,
    public readonly cancellationRate: number,
    public readonly onTimeRate: number,
    public readonly ordersByState: StateOrderSummary[],
    public readonly ordersByPaymentType: PaymentTypeSummary[],
    public readonly topProductsByGmv: ProductRankingEntry[],
    public readonly topProductsByRevenue: ProductRankingEntry[],
  ) {}
}
