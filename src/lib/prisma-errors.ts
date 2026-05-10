import { Prisma } from '../../generated/prisma/client/client.js'

export type PrismaErrorResponse = {
  status: number
  message: string
}

export const parsePrismaError = (error: unknown): PrismaErrorResponse => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return { status: 409, message: 'Ya existe un registro con ese valor' }
      case 'P2003':
        return { status: 422, message: 'Referencia inválida — el recurso relacionado no existe' }
      case 'P2025':
        return { status: 404, message: 'Registro no encontrado' }
      default:
        return { status: 500, message: `Error de base de datos: ${error.code}` }
    }
  }
  return { status: 500, message: 'Error interno del servidor' }
}