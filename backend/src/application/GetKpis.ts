/**
 * Caso de uso: obtiene el resumen de indicadores clave de rendimiento (KPIs).
 * Orquesta la llamada al repositorio aplicando los filtros recibidos desde la capa HTTP.
 */

import { IKpiRepository, KpiFilters } from '../domain/ports/IKpiRepository';
import { KpiSummary } from '../domain/entities/KpiSummary';

export class GetKpis {
  /**
   * @param repository - Repositorio de KPIs utilizado para obtener los datos.
   */
  constructor(private readonly repository: IKpiRepository) {}

  /**
   * Ejecuta la obtención del resumen de KPIs aplicando los filtros indicados.
   *
   * @param filters - Filtros para acotar la consulta (rango de fechas, categoría, etc.).
   * @returns Promesa con el resumen de indicadores clave de rendimiento.
   */
  async execute(filters: KpiFilters): Promise<KpiSummary> {
    return this.repository.getKpis(filters);
  }
}
