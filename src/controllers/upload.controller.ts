import type { Context } from 'hono'
// S3Client es el cliente que se conecta a R2 (R2 es compatible con el protocolo S3 de Amazon)
// PutObjectCommand es el comando para subir un archivo al bucket
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import path from 'path'

// Creamos el cliente S3 con las credenciales de R2
// Esto se ejecuta una sola vez cuando el servidor arranca
const s3 = new S3Client({
  region: 'auto', // R2 no usa regiones como AWS, 'auto' es el valor correcto
  endpoint: process.env.R2_ENDPOINT!, // la URL de tu cuenta de Cloudflare
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,       // clave pública del token
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!, // clave privada del token
  },
})

export const uploadReceipt = async (c: Context) => {
  // parseBody() lee el cuerpo multipart/form-data (el formato que usan los formularios con archivos)
  const body = await c.req.parseBody()
  const file = body['receipt'] // el campo se llama "receipt" — debe coincidir con lo que envía el cliente

  // Si no viene archivo o viene como texto plano, rechazamos
  if (!file || typeof file === 'string') {
    return c.json({ error: 'Se requiere un archivo en el campo "receipt"' }, 400 as any)
  }

  // Solo aceptamos imágenes JPEG, PNG o WebP
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return c.json(
      { error: 'Tipo de archivo no permitido. Usa JPEG, PNG o WebP' },
      422 as any
    )
  }

  // Límite de 5 MB — file.size viene en bytes
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return c.json({ error: 'El archivo supera el límite de 5 MB' }, 422 as any)
  }

  // Generamos un nombre único para evitar colisiones entre archivos
  // randomUUID() genera algo como: "a3f2c1d4-..." para que no haya dos archivos con el mismo nombre
  const ext = path.extname(file.name) || '.jpg'
  const filename = `${randomUUID()}${ext}`

  // Convertimos el archivo a Buffer (formato binario que entiende el SDK)
  const buffer = Buffer.from(await file.arrayBuffer())

  // Subimos el archivo a R2 usando el comando PutObject
  // Bucket: nombre del bucket donde se guarda
  // Key: nombre del archivo dentro del bucket
  // Body: el contenido binario del archivo
  // ContentType: el tipo MIME para que el navegador lo interprete correctamente
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: filename,
    Body: buffer,
    ContentType: file.type,
  }))

  // Construimos la URL pública donde se puede ver el archivo
  // R2_PUBLIC_URL es la URL del bucket público que habilitamos en Cloudflare
  const receiptUrl = `${process.env.R2_PUBLIC_URL}/${filename}`

  // Devolvemos la URL para que el cliente la pueda guardar en la transacción
  return c.json({ receiptUrl })
}