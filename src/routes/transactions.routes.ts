import { Hono } from 'hono'
import {
  getTransactions,
  getTransactionById,
  getBalance,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactions.controller.js'
import { uploadReceipt } from '../controllers/upload.controller.js'

const transactionsRouter = new Hono()

transactionsRouter.get('/balance', getBalance)
transactionsRouter.post('/upload', uploadReceipt)
transactionsRouter.get('/', getTransactions)
transactionsRouter.get('/:id', getTransactionById)
transactionsRouter.post('/', createTransaction)
transactionsRouter.patch('/:id', updateTransaction)
transactionsRouter.delete('/:id', deleteTransaction)

export default transactionsRouter