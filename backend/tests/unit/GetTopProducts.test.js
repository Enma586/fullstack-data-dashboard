"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetTopProducts_1 = require("../../src/application/GetTopProducts");
const ProductRanking_1 = require("../../src/domain/entities/ProductRanking");
class MockProductRepository {
    async getTopProducts(_filters) {
        return [
            new ProductRanking_1.ProductRanking('PROD-1', 'Electronics', 150, 75000, 60000),
            new ProductRanking_1.ProductRanking('PROD-2', 'Fashion', 200, 45000, 35000),
            new ProductRanking_1.ProductRanking('PROD-3', 'Home', 80, 30000, 25000),
        ];
    }
    async getKpis() {
        throw new Error('Not implemented');
    }
    async getRevenueTrend() {
        throw new Error('Not implemented');
    }
}
describe('GetTopProducts', () => {
    let useCase;
    let repository;
    beforeEach(() => {
        repository = new MockProductRepository();
        useCase = new GetTopProducts_1.GetTopProducts(repository);
    });
    it('debe retornar un ranking de productos con gmv y revenue', async () => {
        const result = await useCase.execute({});
        expect(result).toHaveLength(3);
        expect(result[0]).toBeInstanceOf(ProductRanking_1.ProductRanking);
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
        const filters = {
            limit: 5,
            metric: 'gmv',
            customerState: 'MG',
        };
        await useCase.execute(filters);
        expect(spy).toHaveBeenCalledWith(filters);
    });
});
//# sourceMappingURL=GetTopProducts.test.js.map