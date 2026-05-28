import type { Context } from 'hono'
import { writeFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export const uploadReceipt = async (c: Context) => {
  const body = await c.req.parseBody()
  const file = body['receipt']

  if (!file || typeof file === 'string') {
    return c.json({ error: 'Se requiere un archivo en el campo "receipt"' }, 400 as any)
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return c.json(
      { error: 'Tipo de archivo no permitido. Usa JPEG, PNG o WebP' },
      422 as any
    )
  }

  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return c.json({ error: 'El archivo supera el límite de 5 MB' }, 422 as any)
  }

  await mkdir(UPLOADS_DIR, { recursive: true })
  const ext = path.extname(file.name) || '.jpg'
  const filename = `${randomUUID()}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOADS_DIR, filename), buffer)

  const receiptUrl = `/uploads/${filename}`
  return c.json({ receiptUrl })
}