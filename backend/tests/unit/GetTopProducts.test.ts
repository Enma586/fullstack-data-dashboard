import { GetTopProducts } from '../../src/application/GetTopProducts';
import { ProductRanking } from '../../src/domain/entities/ProductRanking';
import {
  IKpiRepository,
  TopProductFilters,
} from '../../src/domain/ports/IKpiRepository';

class MockProductRepository implements IKpiRepository {
  async getTopProducts(_filters: TopProductFilters): Promise<ProductRanking[]> {
    return [
      new ProductRanking('PROD-1', 'Electronics', 150, 75000, 60000),
      new ProductRanking('PROD-2', 'Fashion', 200, 45000, 35000),
      new ProductRanking('PROD-3', 'Home', 80, 30000, 25000),
    ];
  }

  async getKpis(): Promise<never> {
    throw new Error('Not implemented');
  }

  async getRevenueTrend(): Promise<never> {
    throw new Error('Not implemented');
  }
}

describe('GetTopProducts', () => {
  let useCase: GetTopProducts;
  let repository: IKpiRepository;

  beforeEach(() => {
    repository = new MockProductRepository();
    useCase = new GetTopProducts(repository);
  });

  it('debe retornar un ranking de productos con gmv y revenue', async () => {
    const result = await useCase.execute({});

    expect(result).toHaveLength(3);

    expect(result[0]).toBeInstanceOf(ProductRanking);
    expect(result[0].productId).toBe('PROD-1');
    expect(result[0].productCategory).toBe('Electronics');
    expect(result[0].totalSold).toBe(150);
    expect(result[0].gmv).toBe(75000);
    expect(result[0].revenue).toBe(60000);
  });

  it('debe pasar el limit por defecto cuando no se especifica', async () => {
    const spy = jest.spyOn(repository, 'getTopProducts');

    await useCase.execute({});

    expect(spy).toHaveBeenCalledWith({});
  });

  it('debe pasar el limit y metric personalizados al repositorio', async () => {
    const spy = jest.spyOn(repository, 'getTopProducts');

    const filters: TopProductFilters = {
      limit: 5,
      metric: 'gmv',
      customerState: 'MG',
    };

    await useCase.execute(filters);

    expect(spy).toHaveBeenCalledWith(filters);
  });
});
