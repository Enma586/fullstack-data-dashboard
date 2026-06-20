import { GetKpis } from '../../src/application/GetKpis';
import { KpiSummary } from '../../src/domain/entities/KpiSummary';
import { IKpiRepository, KpiFilters } from '../../src/domain/ports/IKpiRepository';

class MockKpiRepository implements IKpiRepository {
  async getKpis(_filters: KpiFilters): Promise<KpiSummary> {
    return new KpiSummary(
      100000,
      500,
      200,
      10,
      0.02,
      [{ state: 'SP', orderCount: 200 }],
      [{ paymentType: 'credit_card', orderCount: 300, revenue: 80000 }],
      [{ category: 'Electronics', orderCount: 100, revenue: 40000 }],
    );
  }

  async getRevenueTrend(): Promise<never> {
    throw new Error('Not implemented');
  }

  async getTopProducts(): Promise<never> {
    throw new Error('Not implemented');
  }
}

describe('GetKpis', () => {
  let useCase: GetKpis;
  let repository: IKpiRepository;

  beforeEach(() => {
    repository = new MockKpiRepository();
    useCase = new GetKpis(repository);
  });

  it('debe retornar un resumen de KPIs con valores numericos correctos', async () => {
    const result = await useCase.execute({});

    expect(result).toBeInstanceOf(KpiSummary);
    expect(result.totalRevenue).toBe(100000);
    expect(result.totalOrders).toBe(500);
    expect(result.averageOrderValue).toBe(200);
    expect(result.cancelledOrders).toBe(10);
    expect(result.cancellationRate).toBe(0.02);
  });

  it('debe retornar desgloses por estado y tipo de pago', async () => {
    const result = await useCase.execute({});

    expect(result.ordersByState).toHaveLength(1);
    expect(result.ordersByState[0].state).toBe('SP');
    expect(result.ordersByState[0].orderCount).toBe(200);

    expect(result.ordersByPaymentType).toHaveLength(1);
    expect(result.ordersByPaymentType[0].paymentType).toBe('credit_card');
    expect(result.ordersByPaymentType[0].revenue).toBe(80000);
  });

  it('debe retornar categorias principales', async () => {
    const result = await useCase.execute({});

    expect(result.topCategories).toHaveLength(1);
    expect(result.topCategories[0].category).toBe('Electronics');
    expect(result.topCategories[0].revenue).toBe(40000);
  });

  it('debe pasar los filtros al repositorio', async () => {
    const spy = jest.spyOn(repository, 'getKpis');

    const filters: KpiFilters = {
      from: new Date('2020-01-01'),
      to: new Date('2020-02-01'),
      customerState: 'RJ',
      paymentType: 'boleto',
    };

    await useCase.execute(filters);

    expect(spy).toHaveBeenCalledWith(filters);
  });
});
