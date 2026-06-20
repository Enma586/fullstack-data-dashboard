import { FilterParamsDto } from './FilterParamsDto';

export class TrendParamsDto extends FilterParamsDto {
  public readonly grain: 'day' | 'week';

  protected constructor(params: Record<string, string | undefined>) {
    super(params);

    const grain = params.grain ?? params['grain'];

    if (grain && !['day', 'week'].includes(grain)) {
      throw new Error('Parametro invalido: grain debe ser "day" o "week"');
    }
    this.grain = (grain as 'day' | 'week') ?? 'day';
  }

  static fromQuery(
    query: Record<string, string | undefined>,
  ): TrendParamsDto {
    return new TrendParamsDto(query);
  }

  toTrendFilters() {
    return {
      ...this.toFilters(),
      grain: this.grain,
    };
  }
}
