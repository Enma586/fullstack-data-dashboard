import { Request, Response, NextFunction } from 'express';
import { GetRevenueTrend } from '../../../application/GetRevenueTrend';
import { TrendParamsDto } from '../dtos/TrendParamsDto';

export class TrendController {
  constructor(private readonly getRevenueTrend: GetRevenueTrend) {}

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
