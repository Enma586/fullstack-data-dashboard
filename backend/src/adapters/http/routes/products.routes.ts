/**
 * Rutas del endpoint de ranking de productos.
 * Define la ruta GET /top-products con validación de query params.
 */

import { Router } from 'express';
import { ProductsController } from '../controllers/ProductsController';
import { validateQuery } from '../middlewares/validator';
import { FilterParamsDto } from '../dtos/FilterParamsDto';

/**
 * Crea y configura el router para el endpoint de ranking de productos.
 *
 * @param controller - Controlador de productos inyectado.
 * @returns Router de Express con la ruta /top-products configurada.
 */
export function createProductsRouter(
  controller: ProductsController,
): Router {
  const router = Router();
  router.get(
    '/top-products',
    validateQuery((q) => FilterParamsDto.fromQuery(q)),
    (req, res, next) => controller.getTop(req, res, next),
  );
  return router;
}
