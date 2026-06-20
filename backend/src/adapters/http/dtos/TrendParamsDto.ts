/**
 * DTOs para parámetros de tendencia en consultas HTTP.
 * @module dtos/TrendParamsDto
 */

import { FilterParamsDto } from './FilterParamsDto';

/**
 * DTO que extiende FilterParamsDto agregando el parámetro de granularidad
 * (grain) para las consultas de tendencia.
 */
export class TrendParamsDto extends FilterParamsDto {
  /** Granularidad de la tendencia: "day" para diaria o "week" para semanal. */
  public readonly grain: 'day' | 'week';

  /**
   * Construye el DTO a partir de un conjunto de parámetros planos. Valida
   * que el valor de grain sea "day" o "week", y por defecto usa "day".
   * @param params - Objeto con los parámetros de consulta.
   * @throws Error si grain no es "day" ni "week".
   */
  protected constructor(params: Record<string, string | undefined>) {
    super(params);

    const grain = params.grain ?? params['grain'];

    if (grain && !['day', 'week'].includes(grain)) {
      throw new Error('Parametro invalido: grain debe ser "day" o "week"');
    }
    this.grain = (grain as 'day' | 'week') ?? 'day';
  }

  /**
   * Crea una instancia de TrendParamsDto desde los parámetros de consulta.
   * @param query - Objeto con los parámetros de la cadena de consulta.
   * @returns Una nueva instancia de TrendParamsDto.
   */
  static fromQuery(
    query: Record<string, string | undefined>,
  ): TrendParamsDto {
    return new TrendParamsDto(query);
  }

  /**
   * Convierte el DTO a un objeto plano de filtros de tendencia, incluyendo
   * los filtros base y la granularidad.
   * @returns Objeto con from, to, customerState, paymentType y grain.
   */
  toTrendFilters() {
    return {
      ...this.toFilters(),
      grain: this.grain,
    };
  }
}
