import { GetRevenueTrend } from '../../src/application/GetRevenueTrend';
import { RevenueTrend } from '../../src/domain/entities/RevenueTrend';
import {
  IKpiRepository,
  TrendFilters,
} from '../../src/domain/ports/IKpiRepository';

class MockTrendRepository implements IKpiRepository {
  async getRevenueTrend(_filters: TrendFilters): Promise<RevenueTrend[]> {
    return [
      new RevenueTrend('2020-01-01', 5000, 25),
      new RevenueTrend('2020-01-02', 7200, 30),
      new RevenueTrend('2020-01-03', 3100, 15),
    ];
  }

  async getKpis(): Promise<never> {
    throw new Error('Not implemented');
  }

  async getTopProducts(): Promise<never> {
    throw new Error('Not implemented');
  }
}

describe('GetRevenueTrend', () => {
  let useCase: GetRevenueTrend;
  let repository: IKpiRepository;

  beforeEach(() => {
    repository = new MockTrendRepository();
    useCase = new GetRevenueTrend(repository);
  });

  it('debe retornar una lista de puntos de tendencia con revenue y orderCount', async () => {
    const result = await useCase.execute({ grain: 'day' });

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);

    expect(result[0]).toBeInstanceOf(RevenueTrend);
    expect(result[0].period).toBe('2020-01-01');
    expect(result[0].revenue).toBe(5000);
    expect(result[0].orderCount).toBe(25);
  });

  it('debe pasar el grain week al repositorio', async () => {
    const spy = jest.spyOn(repository, 'getRevenueTrend');

    await useCase.execute({ grain: 'week' });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ grain: 'week' }),
    );
  });

  it('debe pasar los filtros adicionales al repositorio', async () => {
    const spy = jest.spyOn(repository, 'getRevenueTrend');

    const filters: TrendFilters = {
      grain: 'day',
      from: new Date('2020-01-01'),
      to: new Date('2020-02-01'),
      customerState: 'SP',
      paymentType: 'credit_card',
    };

    await useCase.execute(filters);

    expect(spy).toHaveBeenCalledWith(filters);
  });
});
