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

export class KpiSummary {
  constructor(
    public readonly totalRevenue: number,
    public readonly totalOrders: number,
    public readonly averageOrderValue: number,
    public readonly cancelledOrders: number,
    public readonly cancellationRate: number,
    public readonly ordersByState: StateOrderSummary[],
    public readonly ordersByPaymentType: PaymentTypeSummary[],
    public readonly topCategories: CategorySummary[],
  ) {}
}
