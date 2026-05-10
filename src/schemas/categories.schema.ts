import * as z from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>