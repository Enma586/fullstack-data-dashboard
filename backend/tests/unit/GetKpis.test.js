"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetKpis_1 = require("../../src/application/GetKpis");
const KpiSummary_1 = require("../../src/domain/entities/KpiSummary");
class MockKpiRepository {
    async getKpis(_filters) {
        return new KpiSummary_1.KpiSummary(120000, 100000, 500, 200, 2.5, 10, 0.02, 0.91, [{ state: 'SP', orderCount: 200 }], [{ paymentType: 'credit_card', orderCount: 300, revenue: 80000 }], [
            { productId: 'PROD-1', productCategory: 'Electronics', totalSold: 100, gmv: 50000, revenue: 40000 },
        ], [
            { productId: 'PROD-2', productCategory: 'Fashion', totalSold: 80, gmv: 30000, revenue: 25000 },
        ]);
    }
    async getRevenueTrend() {
        throw new Error('Not implemented');
    }
    async getTopProducts() {
        throw new Error('Not implemented');
    }
}
describe('GetKpis', () => {
    let useCase;
    let repository;
    beforeEach(() => {
        repository = new MockKpiRepository();
        useCase = new GetKpis_1.GetKpis(repository);
    });
    it('debe retornar un resumen de KPIs con valores numericos correctos', async () => {
        const result = await useCase.execute({});
        expect(result).toBeInstanceOf(KpiSummary_1.KpiSummary);
        expect(result.gmv).toBe(120000);
        expect(result.revenue).toBe(100000);
        expect(result.totalOrders).toBe(500);
        expect(result.averageOrderValue).toBe(200);
        expect(result.itemsPerOrder).toBe(2.5);
        expect(result.cancelledOrders).toBe(10);
        expect(result.cancellationRate).toBe(0.02);
        expect(result.onTimeRate).toBe(0.91);
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
    it('debe retornar rankings de productos por GMV y Revenue', async () => {
        const result = await useCase.execute({});
        expect(result.topProductsByGmv).toHaveLength(1);
        expect(result.topProductsByGmv[0].productId).toBe('PROD-1');
        expect(result.topProductsByGmv[0].gmv).toBe(50000);
        expect(result.topProductsByRevenue).toHaveLength(1);
        expect(result.topProductsByRevenue[0].productId).toBe('PROD-2');
        expect(result.topProductsByRevenue[0].revenue).toBe(25000);
    });
    it('debe pasar los filtros al repositorio', async () => {
        const spy = jest.spyOn(repository, 'getKpis');
        const filters = {
            from: new Date('2020-01-01'),
            to: new Date('2020-02-01'),
            customerState: 'RJ',
            orderStatus: 'delivered',
        };
        await useCase.execute(filters);
        expect(spy).toHaveBeenCalledWith(filters);
    });
});
//# sourceMappingURL=GetKpis.test.js.map