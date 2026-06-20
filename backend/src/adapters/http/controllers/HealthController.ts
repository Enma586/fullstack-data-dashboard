/**
 * Controladores del endpoint de salud.
 * @module controllers/HealthController
 */

import { Request, Response } from 'express';

/**
 * Controlador del endpoint de salud.
 * Responde a GET /health con el estado del servidor.
 */
export class HealthController {
  /**
   * Devuelve el estado actual del servidor.
   * @param _req - Objeto de solicitud Express (no utilizado).
   * @param res  - Objeto de respuesta Express.
   */
  check(_req: Request, res: Response): void {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }
}
