import { IKpiRepository, KpiFilters } from '../domain/ports/IKpiRepository';
import { KpiSummary } from '../domain/entities/KpiSummary';

export class GetKpis {
  constructor(private readonly repository: IKpiRepository) {}

  async execute(filters: KpiFilters): Promise<KpiSummary> {
    return this.repository.getKpis(filters);
  }
}
