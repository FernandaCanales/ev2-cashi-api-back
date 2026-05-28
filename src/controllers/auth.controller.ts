import type { Context } from 'hono'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const { sign } = jwt
import { usersRepository } from '../repositories/users.repository.js'
import { registerSchema, loginSchema } from '../schemas/auth.schema.js'
import { parsePrismaError } from '../lib/prisma-errors.js'

const JWT_SECRET = process.env.JWT_SECRET!
const SALT_ROUNDS = 10

export const register = async (c: Context) => {
  const body = await c.req.json()
  const result = registerSchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400 as any)

  const { email, password } = result.data
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  try {
    const user = await usersRepository.create(email, passwordHash)
    const token = sign(
      { sub: String(user.id), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    return c.json({ token }, 201 as any)
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}

export const login = async (c: Context) => {
  const body = await c.req.json()
  const result = loginSchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400 as any)

  const { email, password } = result.data
  const user = await usersRepository.findByEmail(email)

  if (!user) return c.json({ error: 'Credenciales inválidas' }, 401 as any)

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) return c.json({ error: 'Credenciales inválidas' }, 401 as any)

  const token = sign(
    { sub: String(user.id), email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  return c.json({ token })
}