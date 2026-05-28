import type { Context } from 'hono'
import { transactionsRepository } from '../repositories/transactions.repository.js'
import { createTransactionSchema, updateTransactionSchema } from '../schemas/transactions.schema.js'
import { parsePrismaError } from '../lib/prisma-errors.js'

export const getTransactions = async (c: Context) => {
  const userId = c.get('userId') as number
  const transactions = await transactionsRepository.findAll(userId)
  return c.json(transactions)
}

export const getTransactionById = async (c: Context) => {
  const id = Number(c.req.param('id'))
  const transaction = await transactionsRepository.findById(id)
  if (!transaction) return c.json({ error: 'Transaccion no encontrada' }, 404 as any)
  return c.json(transaction)
}

export const getBalance = async (c: Context) => {
  const userId = c.get('userId') as number
  const transactions = await transactionsRepository.findAllRaw(userId)
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense
  return c.json({ totalIncome, totalExpense, balance })
}

export const createTransaction = async (c: Context) => {
  const userId = c.get('userId') as number
  const body = await c.req.json()
  const result = createTransactionSchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400 as any)
  try {
    const transaction = await transactionsRepository.create(result.data, userId)
    return c.json(transaction, 201 as any)
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}

export const updateTransaction = async (c: Context) => {
  const userId = c.get('userId') as number
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const result = updateTransactionSchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400 as any)

  const existing = await transactionsRepository.findById(id)
  if (!existing) return c.json({ error: 'Transaccion no encontrada' }, 404 as any)
  if (existing.userId !== userId) return c.json({ error: 'No autorizado' }, 403 as any)

  try {
    const transaction = await transactionsRepository.update(id, result.data)
    return c.json(transaction)
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}

export const deleteTransaction = async (c: Context) => {
  const userId = c.get('userId') as number
  const id = Number(c.req.param('id'))

  const existing = await transactionsRepository.findById(id)
  if (!existing) return c.json({ error: 'Transaccion no encontrada' }, 404 as any)
  if (existing.userId !== userId) return c.json({ error: 'No autorizado' }, 403 as any)

  try {
    await transactionsRepository.remove(id)
    return c.json({ message: 'Transaccion eliminada correctamente' })
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}