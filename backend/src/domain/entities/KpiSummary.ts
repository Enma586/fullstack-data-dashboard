/**
 * Resumen de pedidos agrupados por estado del cliente.
 */
export interface StateOrderSummary {
  /** Código del estado (ej. SP, RJ, MG). */
  state: string;
  /** Cantidad de pedidos en ese estado. */
  orderCount: number;
}

/**
 * Resumen de pedidos agrupados por tipo de pago.
 */
export interface PaymentTypeSummary {
  /** Tipo de pago (credit_card, boleto, voucher, debit_card). */
  paymentType: string;
  /** Cantidad de pedidos con ese tipo de pago. */
  orderCount: number;
  /** Ingreso total generado por ese tipo de pago. */
  revenue: number;
}

/**
 * Entrada del ranking de productos dentro del resumen de KPIs.
 */
export interface ProductRankingEntry {
  /** Identificador del producto. */
  productId: string;
  /** Categoría del producto (inglés). */
  productCategory: string;
  /** Unidades totales vendidas. */
  totalSold: number;
  /** GMV (suma de precios de ítem) generado por el producto. */
  gmv: number;
  /** Ingreso real (pago prorrateado) generado por el producto. */
  revenue: number;
}

/**
 * Entidad del dominio que agrupa todos los indicadores clave de rendimiento.
 * Se construye a partir de una única consulta al esquema gold y contiene
 * métricas agregadas, desgloses geográficos/financieros y rankings de productos.
 */
export class KpiSummary {
  constructor(
    /** Valor bruto de mercancía (suma de precios de ítem). */
    public readonly gmv: number,
    /** Ingreso real (suma de pagos prorrateados por ítem). */
    public readonly revenue: number,
    /** Cantidad total de pedidos únicos en el período. */
    public readonly totalOrders: number,
    /** Valor promedio por pedido (revenue / orders). */
    public readonly averageOrderValue: number,
    /** Promedio de ítems por pedido (total_items / orders). */
    public readonly itemsPerOrder: number,
    /** Cantidad de pedidos cancelados. */
    public readonly cancelledOrders: number,
    /** Tasa de cancelación (cancelados / totales). */
    public readonly cancellationRate: number,
    /** Tasa de entrega a tiempo (on_time / delivered). */
    public readonly onTimeRate: number,
    /** Desglose de pedidos por estado del cliente. */
    public readonly ordersByState: StateOrderSummary[],
    /** Desglose de pedidos e ingresos por tipo de pago. */
    public readonly ordersByPaymentType: PaymentTypeSummary[],
    /** Top 10 productos ordenados por GMV. */
    public readonly topProductsByGmv: ProductRankingEntry[],
    /** Top 10 productos ordenados por Revenue. */
    public readonly topProductsByRevenue: ProductRankingEntry[],
  ) {}
}
