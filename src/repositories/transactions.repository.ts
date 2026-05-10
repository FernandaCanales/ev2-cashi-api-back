import { prisma } from '../lib/prisma.js'
import type { CreateTransactionInput, UpdateTransactionInput } from '../schemas/transactions.schema.js'
import type { Transaction } from '../../generated/prisma/client/client.js'

type TransactionWithCategory = Transaction & {
  category: { id: number; name: string }
}

interface TransactionRepository {
  findAll: () => Promise<TransactionWithCategory[]>
  findById: (id: number) => Promise<TransactionWithCategory | null>
  findAllRaw: () => Promise<Transaction[]>
  create: (data: CreateTransactionInput) => Promise<Transaction>
  update: (id: number, data: UpdateTransactionInput) => Promise<Transaction>
  remove: (id: number) => Promise<void>
}

export const transactionsRepository: TransactionRepository = {
  findAll: () =>
    prisma.transaction.findMany({ include: { category: true } }),

  findById: (id) =>
    prisma.transaction.findUnique({ where: { id }, include: { category: true } }),

  findAllRaw: () => prisma.transaction.findMany(),

  create: (data) =>
    prisma.transaction.create({
      data: { ...data, date: new Date(data.date) },
    }),

  update: (id, data) =>
    prisma.transaction.update({
      where: { id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
    }),

  remove: (id) => prisma.transaction.delete({ where: { id } }).then(() => undefined),
}