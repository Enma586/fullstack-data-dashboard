import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

type DtoFactory<T> = (query: Record<string, string | undefined>) => T;

export function validateQuery<T>(factory: DtoFactory<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const dto = factory(req.query as Record<string, string | undefined>);
      req.app.locals.dto = dto;
      next();
    } catch (error) {
      next(
        new AppError(
          400,
          error instanceof Error ? error.message : 'Parametros invalidos',
        ),
      );
    }
  };
}
