/**
 * Controlador del endpoint de ranking de productos.
 * Responde a GET /top-products con el ranking de productos más vendidos.
 */

import { Request, Response, NextFunction } from 'express';
import { GetTopProducts } from '../../../application/GetTopProducts';
import { FilterParamsDto } from '../dtos/FilterParamsDto';

export class ProductsController {
  /**
   * @param getTopProducts - Caso de uso para obtener el ranking de productos.
   */
  constructor(private readonly getTopProducts: GetTopProducts) {}

  /**
   * Obtiene el ranking de productos más vendidos aplicando los filtros recibidos.
   *
   * @param req  - Request de Express con los query params (`from`, `to`, `customer_state`, `payment_type`, `limit`).
   * @param res  - Response de Express.
   * @param next - Función para pasar el error al manejador centralizado.
   */
  async getTop(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: FilterParamsDto = req.app.locals.dto;
      const rawLimit = req.query.limit as string | undefined;

      let limit: number | undefined;
      if (rawLimit !== undefined) {
        limit = Number(rawLimit);
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
          res.status(400).json({
            error: 'Parametro invalido: limit debe ser un entero entre 1 y 100',
          });
          return;
        }
      }

      const ranking = await this.getTopProducts.execute({
        ...dto.toFilters(),
        limit,
      });

      res.json(ranking);
    } catch (error) {
      next(error);
    }
  }
}
