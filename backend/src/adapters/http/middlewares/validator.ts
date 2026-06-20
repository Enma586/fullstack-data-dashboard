/**
 * Middleware de validación de parámetros de consulta.
 * @module middlewares/validator
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Tipo alias para una función fábrica que construye un DTO a partir de
 * los parámetros de consulta.
 * @typeParam T - Tipo del DTO de destino.
 */
type DtoFactory<T> = (query: Record<string, string | undefined>) => T;

/**
 * Crea un middleware de Express que valida los parámetros de consulta usando
 * la fábrica de DTO proporcionada. Si la validación falla, responde con un
 * error 400 (AppError).
 * @param factory - Función que construye el DTO desde los query params.
 * @returns Middleware de Express para validación.
 */
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
