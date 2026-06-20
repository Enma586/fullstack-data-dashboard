/**
 * Controladores del endpoint de tendencias.
 * @module controllers/TrendController
 */

import { Request, Response, NextFunction } from 'express';
import { GetRevenueTrend } from '../../../application/GetRevenueTrend';
import { TrendParamsDto } from '../dtos/TrendParamsDto';

/**
 * Controlador del endpoint de tendencias.
 * Responde a GET /trend/revenue con la tendencia de ingresos.
 */
export class TrendController {
  /**
   * @param getRevenueTrend - Caso de uso para obtener la tendencia de ingresos.
   */
  constructor(private readonly getRevenueTrend: GetRevenueTrend) {}

  /**
   * Obtiene la tendencia de ingresos aplicando los filtros y la granularidad
   * especificados en la solicitud.
   * @param req  - Objeto de solicitud Express.
   * @param res  - Objeto de respuesta Express.
   * @param next - Función para pasar el control al siguiente middleware.
   */
  async getRevenue(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: TrendParamsDto = req.app.locals.dto;
      const trend = await this.getRevenueTrend.execute(dto.toTrendFilters());
      res.json(trend);
    } catch (error) {
      next(error);
    }
  }
}
