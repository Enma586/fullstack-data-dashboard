import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../src/adapters/http/middlewares/errorHandler';
import { GetKpis } from '../../src/application/GetKpis';
import { GetRevenueTrend } from '../../src/application/GetRevenueTrend';
import { GetTopProducts } from '../../src/application/GetTopProducts';
import { KpiController } from '../../src/adapters/http/controllers/KpiController';
import { TrendController } from '../../src/adapters/http/controllers/TrendController';
import { HealthController } from '../../src/adapters/http/controllers/HealthController';
import { createHealthRouter } from '../../src/adapters/http/routes/health.routes';
import { createKpiRouter } from '../../src/adapters/http/routes/kpi.routes';
import { createTrendRouter } from '../../src/adapters/http/routes/trend.routes';
import { KpiSummary } from '../../src/domain/entities/KpiSummary';
import { RevenueTrend } from '../../src/domain/entities/RevenueTrend';
import { ProductRanking } from '../../src/domain/entities/ProductRanking';
import {
  IKpiRepository,
  KpiFilters,
  TrendFilters,
  TopProductFilters,
} from '../../src/domain/ports/IKpiRepository';

/**
 * Repositorio mock completo para pruebas de integración.
 * Implementa todos los métodos de IKpiRepository con datos fijos.
 */
class MockRepository implements IKpiRepository {
  async getKpis(_filters: KpiFilters): Promise<KpiSummary> {
    return new KpiSummary(
      100000,
      500,
      200,
      10,
      0.02,
      [
        { state: 'SP', orderCount: 200 },
        { state: 'RJ', orderCount: 150 },
      ],
      [
        { paymentType: 'credit_card', orderCount: 300, revenue: 80000 },
        { paymentType: 'boleto', orderCount: 150, revenue: 15000 },
      ],
      [
        { category: 'Electronics', orderCount: 100, revenue: 40000 },
        { category: 'Fashion', orderCount: 80, revenue: 25000 },
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

  async getTopProducts(_filters: TopProductFilters): Promise<ProductRanking[]> {
    return [
      new ProductRanking('PROD-1', 'Electronics', 150, 75000),
      new ProductRanking('PROD-2', 'Fashion', 200, 45000),
    ];
  }
}

/**
 * Construye una aplicación Express de prueba con los routers y el
 * manejador de errores, usando el MockRepository como respaldo.
 */
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

  app.use(createHealthRouter(healthController));
  app.use(createKpiRouter(kpiController));
  app.use(createTrendRouter(trendController));
  app.use(errorHandler);

  return app;
}

describe('API de KPIs (Integracion)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    /** El endpoint de salud debe responder 200 con status "ok" y timestamp */
    it('debe retornar 200 con status ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /kpis', () => {
    /** La respuesta debe incluir todos los campos del KpiSummary */
    it('debe retornar 200 con estructura completa de KPIs', async () => {
      const res = await request(app).get('/kpis');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalRevenue', 100000);
      expect(res.body).toHaveProperty('totalOrders', 500);
      expect(res.body).toHaveProperty('averageOrderValue');
      expect(res.body).toHaveProperty('cancellationRate', 0.02);
      expect(res.body.ordersByState).toHaveLength(2);
      expect(res.body.ordersByPaymentType).toHaveLength(2);
      expect(res.body.topCategories).toHaveLength(2);
    });

    /** Los filtros opcionales en query string no deben romper la respuesta */
    it('debe aceptar filtros opcionales en query string', async () => {
      const res = await request(app).get(
        '/kpis?from=2020-01-01&to=2020-03-01&customer_state=SP&payment_type=credit_card',
      );

      expect(res.status).toBe(200);
    });

    /** customer_state inválido debe devolver 400 */
    it('debe retornar 400 cuando customer_state es invalido', async () => {
      const res = await request(app).get('/kpis?customer_state=INVALIDO');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    /** payment_type inválido debe devolver 400 */
    it('debe retornar 400 cuando payment_type es invalido', async () => {
      const res = await request(app).get('/kpis?payment_type=invalid');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    /** Una fecha inválida en from debe devolver 400 */
    it('debe retornar 400 cuando from no es una fecha valida', async () => {
      const res = await request(app).get('/kpis?from=no-es-fecha');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /trend/revenue', () => {
    /** Sin parámetros debe retornar tendencia diaria */
    it('debe retornar 200 con tendencia diaria por defecto', async () => {
      const res = await request(app).get('/trend/revenue');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('period');
      expect(res.body[0]).toHaveProperty('revenue');
      expect(res.body[0]).toHaveProperty('orderCount');
    });

    /** grain=week debe cambiar la agrupación a semanal */
    it('debe retornar tendencia semanal cuando grain=week', async () => {
      const res = await request(app).get('/trend/revenue?grain=week');

      expect(res.status).toBe(200);
      expect(res.body[0].period).toBeDefined();
    });

    /** Un valor inválido para grain debe devolver 400 */
    it('debe retornar 400 cuando grain es invalido', async () => {
      const res = await request(app).get('/trend/revenue?grain=month');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    /** Todos los filtros combinados deben funcionar juntos */
    it('debe retornar 200 con todos los filtros combinados', async () => {
      const res = await request(app).get(
        '/trend/revenue?grain=day&from=2020-01-01&to=2020-02-01&customer_state=SP&payment_type=credit_card',
      );

      expect(res.status).toBe(200);
    });
  });
});
