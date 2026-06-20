import { Router } from 'express';
import { TrendController } from '../controllers/TrendController';
import { validateQuery } from '../middlewares/validator';
import { TrendParamsDto } from '../dtos/TrendParamsDto';

export function createTrendRouter(controller: TrendController): Router {
  const router = Router();
  router.get(
    '/trend/revenue',
    validateQuery((q) => TrendParamsDto.fromQuery(q)),
    (req, res, next) => controller.getRevenue(req, res, next),
  );
  return router;
}
