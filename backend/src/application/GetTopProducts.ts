/**
 * Caso de uso: obtiene el ranking de productos más vendidos.
 * Orquesta la llamada al repositorio aplicando los filtros recibidos desde la capa HTTP.
 */

import { IKpiRepository, TopProductFilters } from '../domain/ports/IKpiRepository';
import { ProductRanking } from '../domain/entities/ProductRanking';

export class GetTopProducts {
  /**
   * @param repository - Repositorio de KPIs utilizado para obtener los datos.
   */
  constructor(private readonly repository: IKpiRepository) {}

  /**
   * Ejecuta la obtención del ranking de productos aplicando los filtros indicados.
   *
   * @param filters - Filtros para acotar la consulta (rango de fechas, límite, etc.).
   * @returns Promesa con un arreglo de productos rankeados.
   */
  async execute(filters: TopProductFilters): Promise<ProductRanking[]> {
    return this.repository.getTopProducts(filters);
  }
}
