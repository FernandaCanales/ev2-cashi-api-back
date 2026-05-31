# ev2-cashi-api-back

API REST de finanzas personales construida con arquitectura N-Layer para la Evaluación 2 y 3 del ramo Desarrollo de Aplicaciones Web II.

## Videos demostrativos

- Evaluación 2: https://youtu.be/iYWxGRk_LTI
- Evaluación 3: https://youtu.be/yONMV4rf6Mw

---

## Tecnologías usadas

- Node.js v24
- TypeScript
- Hono v4
- Prisma v7
- PostgreSQL 16
- Docker
- Zod v4
- bcryptjs
- jsonwebtoken
- @aws-sdk/client-s3

---

## Requisitos previos

- Node.js instalado
- Yarn instalado
- Docker Desktop instalado y corriendo

---

## Cómo instalar y levantar el proyecto

### 1. Clonar el repositorio

```
git clone https://github.com/FernandaCanales/ev2-cashi-api-back.git
cd ev2-cashi-api-back
```

### 2. Instalar dependencias

```
yarn install
```

### 3. Crear el archivo .env

Crea un archivo `.env` en la raíz del proyecto con este contenido:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cashidb"
JWT_SECRET="cashi-super-secret-key-cambiar-en-produccion-2026"

# Cloudflare R2 — opcional en desarrollo, requerido en producción
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""
```

> Si las variables R2 no están definidas, los comprobantes se guardan localmente en `uploads/`. En producción se suben a Cloudflare R2 automáticamente.

### 4. Levantar la base de datos con Docker

Asegúrate de tener Docker Desktop abierto y corriendo, luego:

```
docker compose up -d
```

### 5. Correr las migraciones

```
yarn prisma migrate dev --name init
```

### 6. Generar el cliente de Prisma

```
yarn prisma generate
```

### 7. Correr el servidor

```
yarn dev
```

El servidor queda corriendo en http://localhost:3000

---

## Endpoints disponibles

### Autenticación (pública — no requiere token)

```
POST    /auth/register     Crea una cuenta. Devuelve un JWT.
POST    /auth/login        Inicia sesión. Devuelve un JWT.
```

### Categorías (requiere token)

```
GET     /categories        Lista todas las categorías
GET     /categories/:id    Detalle de una categoría
POST    /categories        Crea una categoría
PATCH   /categories/:id    Actualiza una categoría
DELETE  /categories/:id    Elimina una categoría
```

### Transacciones (requiere token)

```
GET     /transactions              Lista las transacciones del usuario autenticado
GET     /transactions/balance      Balance del usuario autenticado
GET     /transactions/:id          Detalle de una transacción
POST    /transactions              Crea una transacción (userId se toma del token)
PATCH   /transactions/:id          Actualiza una transacción (solo si es el dueño)
DELETE  /transactions/:id          Elimina una transacción (solo si es el dueño)
POST    /transactions/upload       Sube un comprobante, devuelve la URL
```

---

## Autenticación

Todas las rutas excepto `/auth/register` y `/auth/login` requieren un JWT válido en el header:

```
Authorization: Bearer TU_TOKEN
```

Si no se envía el token o es inválido, la API responde `401 Unauthorized`.
Si se intenta editar o eliminar una transacción de otro usuario, responde `403 Forbidden`.

---

## Subida de comprobantes

`POST /transactions/upload` recibe una imagen en el campo `receipt` (multipart/form-data).
Tipos aceptados: JPEG, PNG, WebP. Tamaño máximo: 5 MB.
Devuelve la URL del archivo para usarla al crear o editar una transacción.

En desarrollo las imágenes se guardan en `uploads/`. En producción se suben a Cloudflare R2 si las variables de entorno están configuradas.

---

## Despliegue en Render

**Build Command:**
```
yarn install && yarn build && yarn prisma generate
```

**Start Command:**
```
yarn start
```

**Variables de entorno requeridas en Render:**

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Internal Database URL de Render |
| `JWT_SECRET` | Clave secreta para firmar los JWT |
| `R2_ACCOUNT_ID` | Account ID de Cloudflare |
| `R2_ACCESS_KEY_ID` | Access Key de R2 |
| `R2_SECRET_ACCESS_KEY` | Secret Key de R2 |
| `R2_BUCKET_NAME` | Nombre del bucket |
| `R2_PUBLIC_URL` | URL pública del bucket |
| `NODE_ENV` | `production` |

---

## Arquitectura N-Layer

```
src/
├── routes/          -> Define los endpoints. Solo mapea URLs a controllers.
├── controllers/     -> Recibe el request, valida con Zod, llama al repository y responde.
├── repositories/    -> Única capa que habla con la base de datos vía Prisma.
├── schemas/         -> Define la forma y validación de los datos con Zod.
├── middlewares/     -> Middleware de autenticación JWT centralizado.
└── lib/             -> Utilidades compartidas: singleton de Prisma y helper de errores.
```

El middleware de autenticación está centralizado en `middlewares/auth.middleware.ts`.
El ownership check (verificar que la transacción pertenece al usuario) está en el controller.
El controller nunca importa Prisma directamente. El repository nunca maneja HTTP.

---

## Comandos útiles

```
yarn dev                               # Corre el servidor en desarrollo
yarn build                             # Compila para producción
docker compose up -d                   # Levanta la base de datos
docker compose stop                    # Detiene la base de datos
yarn prisma studio                     # Interfaz visual de la base de datos
yarn prisma migrate dev --name nombre  # Crea una nueva migración
yarn prisma generate                   # Genera el cliente de Prisma
yarn prisma migrate deploy             # Aplica migraciones en producción
```

---

## Uso de IA

Se utilizó Claude (Anthropic) como asistente durante el desarrollo.

**Para qué se usó:**
- Generación de la estructura base de cada capa
- Implementación de autenticación con JWT y bcrypt
- Configuración del middleware de autenticación en Hono
- Resolución de errores de compatibilidad con Prisma 7 y Yarn Berry
- Configuración de subida de imágenes con estrategia dual (local / Cloudflare R2)
- Configuración del despliegue en Render

**Lo que aprendimos:**
- Cómo separar responsabilidades en arquitectura N-Layer
- Por qué el middleware de auth debe registrarse antes que las rutas con `app.use()`
- Por qué el ownership check está en el controller y no en el repository
- Cómo fluye el token desde el login hasta una request protegida
- Por qué `/balance` y `/upload` deben ir antes que `/:id` en las rutas
- Por qué las contraseñas se hashean con bcrypt y no con SHA-256
- Cómo funciona la estrategia dual de subida de archivos (local en desarrollo, R2 en producción)