/**
 * Rutas del endpoint de KPIs.
 * @module routes/kpi.routes
 */

import { Router } from 'express';
import { KpiController } from '../controllers/KpiController';
import { validateQuery } from '../middlewares/validator';
import { FilterParamsDto } from '../dtos/FilterParamsDto';

/**
 * Crea y configura el enrutador para el endpoint de KPIs (GET /kpis).
 * Aplica el middleware de validación de filtros antes de llegar al controlador.
 * @param controller - Instancia de KpiController.
 * @returns Enrutador de Express configurado.
 */
export function createKpiRouter(controller: KpiController): Router {
  const router = Router();
  router.get(
    '/kpis',
    validateQuery((q) => FilterParamsDto.fromQuery(q)),
    (req, res, next) => controller.get(req, res, next),
  );
  return router;
}
