/**
 * Rutas del endpoint de tendencias.
 * @module routes/trend.routes
 */

import { Router } from 'express';
import { TrendController } from '../controllers/TrendController';
import { validateQuery } from '../middlewares/validator';
import { TrendParamsDto } from '../dtos/TrendParamsDto';

/**
 * Crea y configura el enrutador para el endpoint de tendencia de ingresos
 * (GET /trend/revenue). Aplica el middleware de validación de parámetros
 * antes de llegar al controlador.
 * @param controller - Instancia de TrendController.
 * @returns Enrutador de Express configurado.
 */
export function createTrendRouter(controller: TrendController): Router {
  const router = Router();
  router.get(
    '/trend/revenue',
    validateQuery((q) => TrendParamsDto.fromQuery(q)),
    (req, res, next) => controller.getRevenue(req, res, next),
  );
  return router;
}
