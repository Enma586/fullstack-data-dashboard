import { Request, Response, NextFunction } from 'express';
import { GetKpis } from '../../../application/GetKpis';
import { FilterParamsDto } from '../dtos/FilterParamsDto';

export class KpiController {
  constructor(private readonly getKpis: GetKpis) {}

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
