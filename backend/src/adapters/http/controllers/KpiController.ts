/**
 * Controladores del endpoint de KPIs.
 * @module controllers/KpiController
 */

import { Request, Response, NextFunction } from 'express';
import { GetKpis } from '../../../application/GetKpis';
import { FilterParamsDto } from '../dtos/FilterParamsDto';

/**
 * Controlador del endpoint de KPIs.
 * Responde a GET /kpis con el resumen de indicadores filtrados.
 */
export class KpiController {
  /**
   * @param getKpis - Caso de uso para obtener los KPIs.
   */
  constructor(private readonly getKpis: GetKpis) {}

  /**
   * Obtiene el resumen de KPIs aplicando los filtros de la solicitud.
   * @param req  - Objeto de solicitud Express.
   * @param res  - Objeto de respuesta Express.
   * @param next - Función para pasar el control al siguiente middleware.
   */
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: FilterParamsDto = req.app.locals.dto;
      const summary = await this.getKpis.execute(dto.toFilters());
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
}
