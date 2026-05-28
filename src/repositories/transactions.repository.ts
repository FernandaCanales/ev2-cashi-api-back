import { prisma } from '../lib/prisma.js'
import type { CreateTransactionInput, UpdateTransactionInput } from '../schemas/transactions.schema.js'
import type { Transaction } from '../../generated/prisma/client/client.js'

type TransactionWithCategory = Transaction & {
  category: { id: number; name: string }
}

interface TransactionRepository {
  findAll: (userId: number) => Promise<TransactionWithCategory[]>
  findById: (id: number) => Promise<TransactionWithCategory | null>
  findAllRaw: (userId: number) => Promise<Transaction[]>
  create: (data: CreateTransactionInput, userId: number) => Promise<Transaction>
  update: (id: number, data: UpdateTransactionInput) => Promise<Transaction>
  remove: (id: number) => Promise<void>
}

export const transactionsRepository: TransactionRepository = {
  findAll: (userId) =>
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
    }),

  findById: (id) =>
    prisma.transaction.findUnique({ where: { id }, include: { category: true } }),

  findAllRaw: (userId) =>
    prisma.transaction.findMany({ where: { userId } }),

  create: (data, userId) =>
    prisma.transaction.create({
      data: { ...data, date: new Date(data.date), userId },
    }),

  update: (id, data) =>
    prisma.transaction.update({
      where: { id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
    }),

  remove: (id) =>
    prisma.transaction.delete({ where: { id } }).then(() => undefined),
}