import { Request, Response, NextFunction } from 'express';
import { GetTopProducts } from '../../../application/GetTopProducts';
import { FilterParamsDto } from '../dtos/FilterParamsDto';

export class ProductsController {
  constructor(private readonly getTopProducts: GetTopProducts) {}

  async getRanking(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: FilterParamsDto = req.app.locals.dto;
      const rawLimit = req.query.limit as string | undefined;
      const rawMetric = req.query.metric as string | undefined;

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

      let metric: 'gmv' | 'revenue' | undefined;
      if (rawMetric !== undefined) {
        if (rawMetric !== 'gmv' && rawMetric !== 'revenue') {
          res.status(400).json({
            error: 'Parametro invalido: metric debe ser "gmv" o "revenue"',
          });
          return;
        }
        metric = rawMetric;
      }

      const ranking = await this.getTopProducts.execute({
        ...dto.toFilters(),
        limit,
        metric,
      });

      res.json(ranking);
    } catch (error) {
      next(error);
    }
  }
}
