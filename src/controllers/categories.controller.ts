import type { Context } from 'hono'
import { categoriesRepository } from '../repositories/categories.repository.js'
import { createCategorySchema, updateCategorySchema } from '../schemas/categories.schema.js'
import { parsePrismaError } from '../lib/prisma-errors.js'

export const getCategories = async (c: Context) => {
  const categories = await categoriesRepository.findAll()
  return c.json(categories)
}

export const getCategoryById = async (c: Context) => {
  const id = Number(c.req.param('id'))
  const category = await categoriesRepository.findById(id)
  if (!category) return c.json({ error: 'Categoría no encontrada' }, 404 as any)
  return c.json(category)
}

export const createCategory = async (c: Context) => {
  const body = await c.req.json()
  const result = createCategorySchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400 as any)
  try {
    const category = await categoriesRepository.create(result.data)
    return c.json(category, 201 as any)
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}

export const updateCategory = async (c: Context) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const result = updateCategorySchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400 as any)
  try {
    const category = await categoriesRepository.update(id, result.data)
    return c.json(category)
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}

export const deleteCategory = async (c: Context) => {
  const id = Number(c.req.param('id'))
  try {
    await categoriesRepository.remove(id)
    return c.json({ message: 'Categoría eliminada correctamente' })
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}