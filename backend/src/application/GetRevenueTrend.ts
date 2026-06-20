/**
 * Caso de uso: obtiene la tendencia de ingresos en el tiempo.
 * Orquesta la llamada al repositorio aplicando los filtros recibidos desde la capa HTTP.
 */

import { IKpiRepository, TrendFilters } from '../domain/ports/IKpiRepository';
import { RevenueTrend } from '../domain/entities/RevenueTrend';

export class GetRevenueTrend {
  /**
   * @param repository - Repositorio de KPIs utilizado para obtener los datos.
   */
  constructor(private readonly repository: IKpiRepository) {}

  /**
   * Ejecuta la obtención de la tendencia de ingresos aplicando los filtros indicados.
   *
   * @param filters - Filtros para acotar la consulta (rango de fechas, período, etc.).
   * @returns Promesa con un arreglo de puntos de tendencia de ingresos.
   */
  async execute(filters: TrendFilters): Promise<RevenueTrend[]> {
    return this.repository.getRevenueTrend(filters);
  }
}
