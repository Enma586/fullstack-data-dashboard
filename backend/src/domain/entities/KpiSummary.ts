/**
 * Entidades del dominio para el resumen de indicadores clave de rendimiento (KPIs).
 * Contiene las estructuras que representan las métricas agregadas del panel de análisis.
 */

/**
 * Resumen de pedidos agrupados por estado.
 * Indica cuántos pedidos existen en cada estado del ciclo de vida.
 */
export interface StateOrderSummary {
  /** Estado del pedido (ej. entregado, pendiente, cancelado). */
  state: string;
  /** Cantidad de pedidos en este estado. */
  orderCount: number;
}

/**
 * Resumen de pedidos agrupados por tipo de pago.
 * Incluye métricas de cantidad de pedidos e ingresos generados.
 */
export interface PaymentTypeSummary {
  /** Tipo de pago (ej. crédito, débito, contado). */
  paymentType: string;
  /** Cantidad de pedidos realizados con este tipo de pago. */
  orderCount: number;
  /** Ingreso total generado por pedidos de este tipo de pago. */
  revenue: number;
}

/**
 * Resumen de pedidos agrupados por categoría de producto.
 * Indica el desempeño comercial de cada categoría.
 */
export interface CategorySummary {
  /** Nombre de la categoría de producto. */
  category: string;
  /** Cantidad de pedidos que incluyen productos de esta categoría. */
  orderCount: number;
  /** Ingreso total generado por esta categoría. */
  revenue: number;
}

/**
 * Resumen global de indicadores clave de rendimiento (KPIs).
 * Agrupa las métricas principales del panel: ingresos totales, volumen de pedidos,
 * valor promedio, pedidos cancelados, tasa de cancelación y desgloses por estado,
 * tipo de pago y categoría.
 */
export class KpiSummary {
  /**
   * @param totalRevenue - Ingreso total del período analizado.
   * @param totalOrders - Número total de pedidos en el período.
   * @param averageOrderValue - Valor promedio de los pedidos.
   * @param cancelledOrders - Cantidad de pedidos cancelados.
   * @param cancellationRate - Tasa de cancelación (proporción sobre el total).
   * @param ordersByState - Desglose de pedidos agrupados por estado.
   * @param ordersByPaymentType - Desglose de pedidos agrupados por tipo de pago.
   * @param topCategories - Ranking de categorías más vendidas.
   */
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
