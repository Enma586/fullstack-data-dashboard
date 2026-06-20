import { IKpiRepository, TopProductFilters } from '../domain/ports/IKpiRepository';
import { ProductRanking } from '../domain/entities/ProductRanking';

export class GetTopProducts {
  constructor(private readonly repository: IKpiRepository) {}

  async execute(filters: TopProductFilters): Promise<ProductRanking[]> {
    return this.repository.getTopProducts(filters);
  }
}
