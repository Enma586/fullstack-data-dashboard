"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetRevenueTrend_1 = require("../../src/application/GetRevenueTrend");
const RevenueTrend_1 = require("../../src/domain/entities/RevenueTrend");
/**
 * Repositorio mock que retorna datos de tendencia fijos.
 * Implementa IKpiRepository y solo define getRevenueTrend;
 * el resto de métodos lanzan error.
 */
class MockTrendRepository {
    async getRevenueTrend(_filters) {
        return [
            new RevenueTrend_1.RevenueTrend('2020-01-01', 5000, 25),
            new RevenueTrend_1.RevenueTrend('2020-01-02', 7200, 30),
            new RevenueTrend_1.RevenueTrend('2020-01-03', 3100, 15),
        ];
    }
    async getKpis() {
        throw new Error('Not implemented');
    }
    async getTopProducts() {
        throw new Error('Not implemented');
    }
}
describe('GetRevenueTrend', () => {
    let useCase;
    let repository;
    beforeEach(() => {
        repository = new MockTrendRepository();
        useCase = new GetRevenueTrend_1.GetRevenueTrend(repository);
    });
    /** La ejecución debe devolver un arreglo de RevenueTrend con 3 elementos */
    it('debe retornar una lista de puntos de tendencia con revenue y orderCount', async () => {
        const result = await useCase.execute({ grain: 'day' });
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(3);
        expect(result[0]).toBeInstanceOf(RevenueTrend_1.RevenueTrend);
        expect(result[0].period).toBe('2020-01-01');
        expect(result[0].revenue).toBe(5000);
        expect(result[0].orderCount).toBe(25);
    });
    /** El filtro grain=week debe propagarse al repositorio */
    it('debe pasar el grain week al repositorio', async () => {
        const spy = jest.spyOn(repository, 'getRevenueTrend');
        await useCase.execute({ grain: 'week' });
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ grain: 'week' }));
    });
    /** Los filtros adicionales (fechas, estado, pago) deben propagarse */
    it('debe pasar los filtros adicionales al repositorio', async () => {
        const spy = jest.spyOn(repository, 'getRevenueTrend');
        const filters = {
            grain: 'day',
            from: new Date('2020-01-01'),
            to: new Date('2020-02-01'),
            customerState: 'SP',
            orderStatus: 'delivered',
        };
        await useCase.execute(filters);
        expect(spy).toHaveBeenCalledWith(filters);
    });
});
//# sourceMappingURL=GetRevenueTrend.test.js.map