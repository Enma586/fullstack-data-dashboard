/**
 * Rutas del endpoint de salud.
 * @module routes/health.routes
 */

import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

/**
 * Crea y configura el enrutador para el endpoint de salud (GET /health).
 * @param controller - Instancia de HealthController.
 * @returns Enrutador de Express configurado.
 */
export function createHealthRouter(
  controller: HealthController,
): Router {
  const router = Router();
  router.get('/health', (req, res) => controller.check(req, res));
  return router;
}
