import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { authMiddleware } from './middlewares/auth.middleware.js'
import authRouter from './routes/auth.routes.js'
import categoriesRouter from './routes/categories.routes.js'
import transactionsRouter from './routes/transactions.routes.js'

type Variables = {
  userId: number
}

const app = new Hono<{ Variables: Variables }>()

// Archivos estáticos (comprobantes)
app.use('/uploads/*', serveStatic({ root: './' }))

// Rutas públicas — sin token
app.route('/auth', authRouter)

// Middleware de auth — ANTES de las rutas protegidas
app.use('/categories/*', authMiddleware)
app.use('/transactions/*', authMiddleware)

// Rutas protegidas
app.route('/categories', categoriesRouter)
app.route('/transactions', transactionsRouter)

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Servidor corriendo en http://localhost:3000')
})