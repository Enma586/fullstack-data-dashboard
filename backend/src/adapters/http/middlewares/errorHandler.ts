/**
 * Middleware de manejo de errores.
 * @module middlewares/errorHandler
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Error personalizado con código de estado HTTP.
 */
export class AppError extends Error {
  /**
   * @param statusCode - Código de estado HTTP del error.
   * @param message    - Mensaje descriptivo del error.
   */
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Middleware global de manejo de errores para Express. Si el error es una
 * instancia de AppError responde con el código y mensaje correspondientes;
 * de lo contrario responde con un error 500 genérico.
 * @param err  - Error lanzado en la cadena de middlewares.
 * @param _req - Objeto de solicitud Express (no utilizado).
 * @param res  - Objeto de respuesta Express.
 * @param _next - Función para pasar al siguiente middleware (no utilizada).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
  });
}
