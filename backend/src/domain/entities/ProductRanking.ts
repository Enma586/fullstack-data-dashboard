/**
 * Entidad del dominio que representa un producto dentro del ranking.
 * Contiene métricas de venta (unidades, GMV e ingresos) para un producto específico.
 */
export class ProductRanking {
  constructor(
    /** Identificador único del producto. */
    public readonly productId: string,
    /** Categoría del producto (nombre en inglés). */
    public readonly productCategory: string,
    /** Unidades totales vendidas en el período. */
    public readonly totalSold: number,
    /** GMV generado (suma de precios de ítem). */
    public readonly gmv: number,
    /** Ingreso real (pago prorrateado). */
    public readonly revenue: number,
  ) {}
}
