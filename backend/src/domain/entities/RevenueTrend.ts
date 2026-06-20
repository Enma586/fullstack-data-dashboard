/**
 * Entidad del dominio que representa un punto en la tendencia de ingresos.
 * Cada instancia refleja el desempeño de un período específico (día o semana).
 */
export class RevenueTrend {
  /**
   * @param period - Identificador del período (ej. fecha ISO o semana del año).
   * @param revenue - Ingreso total acumulado en el período.
   * @param orderCount - Cantidad de pedidos registrados en el período.
   */
  constructor(
    public readonly period: string,
    public readonly revenue: number,
    public readonly orderCount: number,
  ) {}
}
