import { Router } from 'express';
import { KpiController } from '../controllers/KpiController';
import { validateQuery } from '../middlewares/validator';
import { FilterParamsDto } from '../dtos/FilterParamsDto';

export function createKpiRouter(controller: KpiController): Router {
  const router = Router();
  router.get(
    '/kpis',
    validateQuery((q) => FilterParamsDto.fromQuery(q)),
    (req, res, next) => controller.get(req, res, next),
  );
  return router;
}
