import { prisma } from '../lib/prisma.js'
import type { User } from '../../generated/prisma/client/client.js'

//interface para el repositorio de usuarios, con métodos para encontrar un usuario por email y crear un nuevo usuario
interface UsersRepository {
  findByEmail: (email: string) => Promise<User | null>
  create: (email: string, passwordHash: string) => Promise<User>
  
}
//Implementación del repositorio de usuarios utilizando Prisma para interactuar con la base de datos
export const usersRepository: UsersRepository = {
  findByEmail: (email) =>
    prisma.user.findUnique({ where: { email } }),

  create: (email, passwordHash) =>
    prisma.user.create({ data: { email, passwordHash } }),
}