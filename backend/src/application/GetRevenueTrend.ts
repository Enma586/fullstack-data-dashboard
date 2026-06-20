import { IKpiRepository, TrendFilters } from '../domain/ports/IKpiRepository';
import { RevenueTrend } from '../domain/entities/RevenueTrend';

export class GetRevenueTrend {
  constructor(private readonly repository: IKpiRepository) {}

  async execute(filters: TrendFilters): Promise<RevenueTrend[]> {
    return this.repository.getRevenueTrend(filters);
  }
}
