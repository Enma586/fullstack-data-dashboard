import { PrismaClient } from '@prisma/client';

/** Instancia singleton del cliente de Prisma para operaciones con la base de datos. */
export const prisma = new PrismaClient();
