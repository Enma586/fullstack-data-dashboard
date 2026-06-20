/**
 * Puerto del repositorio para consultas analíticas del esquema estrella gold.
 * Define el contrato que deben implementar los adaptadores de persistencia
 * para la obtención de KPIs, tendencias de ingresos y rankings de productos.
 */

import { KpiSummary } from '../entities/KpiSummary';
import { RevenueTrend } from '../entities/RevenueTrend';
import { ProductRanking } from '../entities/ProductRanking';

/**
 * Filtros base para consultas de KPIs.
 * Permite acotar los resultados por rango de fechas, estado del cliente
 * y tipo de pago.
 */
export interface KpiFilters {
  /** Fecha de inicio del período de análisis. */
  from?: Date;
  /** Fecha de fin del período de análisis. */
  to?: Date;
  /** Filtro por estado del cliente (ej. activo, inactivo). */
  customerState?: string;
  /** Filtro por tipo de pago (ej. crédito, contado). */
  paymentType?: string;
}

/**
 * Filtros extendidos para consultas de tendencias de ingresos.
 * Agrega la granularidad temporal (día o semana) sobre los filtros base.
 */
export interface TrendFilters extends KpiFilters {
  /** Granularidad de la tendencia: agrupación por día o por semana. */
  grain: 'day' | 'week';
}

/**
 * Filtros extendidos para consultas de productos más vendidos.
 * Agrega un límite opcional de resultados sobre los filtros base.
 */
export interface TopProductFilters extends KpiFilters {
  /** Número máximo de productos a retornar en el ranking. */
  limit?: number;
}

/**
 * Contrato del repositorio de KPIs.
 * Define las operaciones de lectura que cualquier adaptador de base de datos
 * debe implementar para alimentar el panel de análisis.
 */
export interface IKpiRepository {
  /**
   * Obtiene el resumen global de KPIs aplicando los filtros especificados.
   * @param filters - Filtros para acotar los datos (fechas, estado, pago).
   * @returns Promesa con el resumen de KPIs (ingresos, pedidos, tasas, etc.).
   */
  getKpis(filters: KpiFilters): Promise<KpiSummary>;

  /**
   * Obtiene la tendencia de ingresos en el período y granularidad indicados.
   * @param filters - Filtros que incluyen la granularidad temporal (día/semana).
   * @returns Promesa con un arreglo de puntos de tendencia de ingresos.
   */
  getRevenueTrend(filters: TrendFilters): Promise<RevenueTrend[]>;

  /**
   * Obtiene el ranking de productos más vendidos según los filtros aplicados.
   * @param filters - Filtros que pueden incluir un límite de resultados.
   * @returns Promesa con un arreglo del ranking de productos.
   */
  getTopProducts(filters: TopProductFilters): Promise<ProductRanking[]>;
}
