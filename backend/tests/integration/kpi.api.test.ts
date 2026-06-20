import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../src/adapters/http/middlewares/errorHandler';
import { GetKpis } from '../../src/application/GetKpis';
import { GetRevenueTrend } from '../../src/application/GetRevenueTrend';
import { GetTopProducts } from '../../src/application/GetTopProducts';
import { KpiController } from '../../src/adapters/http/controllers/KpiController';
import { TrendController } from '../../src/adapters/http/controllers/TrendController';
import { HealthController } from '../../src/adapters/http/controllers/HealthController';
import { ProductsController } from '../../src/adapters/http/controllers/ProductsController';
import { createHealthRouter } from '../../src/adapters/http/routes/health.routes';
import { createKpiRouter } from '../../src/adapters/http/routes/kpi.routes';
import { createTrendRouter } from '../../src/adapters/http/routes/trend.routes';
import { createProductsRouter } from '../../src/adapters/http/routes/products.routes';
import { KpiSummary } from '../../src/domain/entities/KpiSummary';
import { RevenueTrend } from '../../src/domain/entities/RevenueTrend';
import { ProductRanking } from '../../src/domain/entities/ProductRanking';
import {
  IKpiRepository,
  KpiFilters,
  TrendFilters,
  TopProductFilters,
} from '../../src/domain/ports/IKpiRepository';

class MockRepository implements IKpiRepository {
  async getKpis(_filters: KpiFilters): Promise<KpiSummary> {
    return new KpiSummary(
      120000,
      100000,
      500,
      200,
      2.5,
      10,
      0.02,
      0.91,
      [
        { state: 'SP', orderCount: 200 },
        { state: 'RJ', orderCount: 150 },
      ],
      [
        { paymentType: 'credit_card', orderCount: 300, revenue: 80000 },
        { paymentType: 'boleto', orderCount: 150, revenue: 15000 },
      ],
      [
        { productId: 'PROD-1', productCategory: 'Electronics', totalSold: 100, gmv: 50000, revenue: 40000 },
      ],
      [
        { productId: 'PROD-2', productCategory: 'Fashion', totalSold: 80, gmv: 30000, revenue: 25000 },
      ],
    );
  }

  async getRevenueTrend(filters: TrendFilters): Promise<RevenueTrend[]> {
    const baseData: RevenueTrend[] = [
      new RevenueTrend('2020-01-01', 5000, 25),
      new RevenueTrend('2020-01-02', 7200, 30),
    ];
    if (filters.grain === 'week') {
      return [
        new RevenueTrend('2019-12-30', 15000, 70),
        new RevenueTrend('2020-01-06', 18000, 85),
      ];
    }
    return baseData;
  }

  async getTopProducts(filters: TopProductFilters): Promise<ProductRanking[]> {
    return [
      new ProductRanking('PROD-1', 'Electronics', 150, 75000, 60000),
      new ProductRanking('PROD-2', 'Fashion', 200, 45000, 35000),
    ];
  }
}

function createTestApp(): express.Application {
  const app = express();
  app.use(express.json());

  const repository = new MockRepository();
  const getKpis = new GetKpis(repository);
  const getRevenueTrend = new GetRevenueTrend(repository);
  const getTopProducts = new GetTopProducts(repository);

  const healthController = new HealthController();
  const kpiController = new KpiController(getKpis);
  const trendController = new TrendController(getRevenueTrend);
  const productsController = new ProductsController(getTopProducts);

  app.use(createHealthRouter(healthController));
  app.use(createKpiRouter(kpiController));
  app.use(createTrendRouter(trendController));
  app.use(createProductsRouter(productsController));
  app.use(errorHandler);

  return app;
}

describe('API de KPIs (Integracion)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('debe retornar 200 con status ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /kpis', () => {
    it('debe retornar 200 con estructura completa de KPIs', async () => {
      const res = await request(app).get('/kpis');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('gmv', 120000);
      expect(res.body).toHaveProperty('revenue', 100000);
      expect(res.body).toHaveProperty('totalOrders', 500);
      expect(res.body).toHaveProperty('averageOrderValue', 200);
      expect(res.body).toHaveProperty('itemsPerOrder', 2.5);
      expect(res.body).toHaveProperty('cancellationRate', 0.02);
      expect(res.body).toHaveProperty('onTimeRate', 0.91);
      expect(res.body.ordersByState).toHaveLength(2);
      expect(res.body.ordersByPaymentType).toHaveLength(2);
      expect(res.body.topProductsByGmv).toHaveLength(1);
      expect(res.body.topProductsByRevenue).toHaveLength(1);
    });

    it('debe aceptar filtros opcionales en query string', async () => {
      const res = await request(app).get(
        '/kpis?from=2020-01-01&to=2020-03-01&customer_state=SP&order_status=delivered',
      );

      expect(res.status).toBe(200);
    });

    it('debe retornar 400 cuando customer_state es invalido', async () => {
      const res = await request(app).get('/kpis?customer_state=INVALIDO');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('debe retornar 400 cuando order_status es invalido', async () => {
      const res = await request(app).get('/kpis?order_status=invalid_status');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('debe retornar 400 cuando from no es una fecha valida', async () => {
      const res = await request(app).get('/kpis?from=no-es-fecha');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /trend/revenue', () => {
    it('debe retornar 200 con tendencia diaria por defecto', async () => {
      const res = await request(app).get('/trend/revenue');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('period');
      expect(res.body[0]).toHaveProperty('revenue');
      expect(res.body[0]).toHaveProperty('orderCount');
    });

    it('debe retornar tendencia semanal cuando grain=week', async () => {
      const res = await request(app).get('/trend/revenue?grain=week');

      expect(res.status).toBe(200);
      expect(res.body[0].period).toBeDefined();
    });

    it('debe retornar 400 cuando grain es invalido', async () => {
      const res = await request(app).get('/trend/revenue?grain=month');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('debe retornar 200 con todos los filtros combinados', async () => {
      const res = await request(app).get(
        '/trend/revenue?grain=day&from=2020-01-01&to=2020-02-01&customer_state=SP&order_status=delivered',
      );

      expect(res.status).toBe(200);
    });
  });

  describe('GET /rankings/products', () => {
    it('debe retornar 200 con ranking de productos', async () => {
      const res = await request(app).get('/rankings/products');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('productId');
      expect(res.body[0]).toHaveProperty('gmv');
      expect(res.body[0]).toHaveProperty('revenue');
    });

    it('debe aceptar el parametro metric=gmv', async () => {
      const res = await request(app).get('/rankings/products?metric=gmv');

      expect(res.status).toBe(200);
    });

    it('debe retornar 400 cuando metric es invalido', async () => {
      const res = await request(app).get('/rankings/products?metric=invalid');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('debe retornar 400 cuando limit no es un entero', async () => {
      const res = await request(app).get('/rankings/products?limit=abc');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
