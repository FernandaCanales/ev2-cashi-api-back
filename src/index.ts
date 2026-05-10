import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import categoriesRouter from './routes/categories.routes.js'
import transactionsRouter from './routes/transactions.routes.js'

const app = new Hono()

app.get('/', (c) => c.json({ message: 'Cashi API funcionando' }))

app.route('/categories', categoriesRouter)
app.route('/transactions', transactionsRouter)

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Servidor corriendo en http://localhost:3000')
})