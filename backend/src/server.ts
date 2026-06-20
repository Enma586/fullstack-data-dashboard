import app from './app';
import { errorHandler } from './adapters/http/middlewares/errorHandler';
import { PrismaKpiRepository } from './infrastructure/repositories/PrismaKpiRepository';
import { GetKpis } from './application/GetKpis';
import { GetRevenueTrend } from './application/GetRevenueTrend';
import { GetTopProducts } from './application/GetTopProducts';
import { HealthController } from './adapters/http/controllers/HealthController';
import { KpiController } from './adapters/http/controllers/KpiController';
import { TrendController } from './adapters/http/controllers/TrendController';
import { createHealthRouter } from './adapters/http/routes/health.routes';
import { createKpiRouter } from './adapters/http/routes/kpi.routes';
import { createTrendRouter } from './adapters/http/routes/trend.routes';

/** Puerto del servidor HTTP. Se obtiene de la variable de entorno `PORT` o por defecto 3000. */
const PORT = process.env.PORT ?? 3000;

const repository = new PrismaKpiRepository();

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

app.listen(PORT, () => {
  console.info(`Servidor iniciado en puerto ${PORT}`);
});
