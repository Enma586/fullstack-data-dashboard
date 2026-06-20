/**
 * Entidad del dominio que representa la posición de un producto en el ranking
 * de productos más vendidos. Incluye métricas de unidades vendidas e ingresos.
 */
export class ProductRanking {
  /**
   * @param productId - Identificador único del producto.
   * @param productCategory - Categoría a la que pertenece el producto.
   * @param totalSold - Cantidad total de unidades vendidas.
   * @param revenue - Ingreso total generado por el producto.
   */
  constructor(
    public readonly productId: string,
    public readonly productCategory: string,
    public readonly totalSold: number,
    public readonly revenue: number,
  ) {}
}
