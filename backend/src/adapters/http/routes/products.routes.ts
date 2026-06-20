import { Router } from 'express';
import { ProductsController } from '../controllers/ProductsController';
import { validateQuery } from '../middlewares/validator';
import { FilterParamsDto } from '../dtos/FilterParamsDto';

export function createProductsRouter(
  controller: ProductsController,
): Router {
  const router = Router();
  router.get(
    '/rankings/products',
    validateQuery((q) => FilterParamsDto.fromQuery(q)),
    (req, res, next) => controller.getRanking(req, res, next),
  );
  return router;
}
