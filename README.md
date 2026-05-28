# ev2-cashi-api-back

API REST de finanzas personales construida con arquitectura N-Layer para la Evaluacion 2 y 3 del ramo Desarrollo de Aplicaciones Web II.

## Video demostrativo
https://youtu.be/iYWxGRk_LTI

---

## Tecnologias usadas

- Node.js v24
- TypeScript
- Hono v4
- Prisma v7
- PostgreSQL 16
- Docker
- Zod v4
- bcryptjs
- jsonwebtoken

---

## Requisitos previos

- Node.js instalado
- Yarn instalado
- Docker Desktop instalado y corriendo

---

## Como instalar y levantar el proyecto

### 1. Clonar el repositorio

git clone https://github.com/FernandaCanales/ev2-cashi-api-back.git
cd ev2-cashi-api-back

### 2. Instalar dependencias

yarn install

### 3. Crear el archivo .env

Crea un archivo .env en la raiz del proyecto con este contenido:

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cashidb"
JWT_SECRET="cashi-super-secret-key-cambiar-en-produccion-2026"

### 4. Levantar la base de datos con Docker

Asegurate de tener Docker Desktop abierto y corriendo, luego:

docker compose up -d

### 5. Correr las migraciones

yarn prisma migrate dev --name init

### 6. Generar el cliente de Prisma

yarn prisma generate

### 7. Correr el servidor

yarn dev

El servidor queda corriendo en http://localhost:3000

---

## Endpoints disponibles

### Autenticacion (publica — no requiere token)

POST    /auth/register     Crea una cuenta. Devuelve un JWT.
POST    /auth/login        Inicia sesion. Devuelve un JWT.

### Categorias (requiere token)

GET     /categories        Lista todas las categorias
GET     /categories/:id    Detalle de una categoria
POST    /categories        Crea una categoria
PATCH   /categories/:id    Actualiza una categoria
DELETE  /categories/:id    Elimina una categoria

### Transacciones (requiere token)

GET     /transactions              Lista las transacciones del usuario autenticado
GET     /transactions/:id          Detalle de una transaccion
POST    /transactions              Crea una transaccion (userId se toma del token)
PATCH   /transactions/:id          Actualiza una transaccion (solo si es el dueno)
DELETE  /transactions/:id          Elimina una transaccion (solo si es el dueno)
GET     /transactions/balance      Balance del usuario autenticado
POST    /transactions/upload       Sube un comprobante, devuelve la URL

---

## Autenticacion

Todas las rutas excepto /auth/register y /auth/login requieren un JWT valido en el header:

Authorization: Bearer TU_TOKEN

Si no se envia el token o es invalido, la API responde 401 Unauthorized.
Si se intenta editar o eliminar una transaccion de otro usuario, responde 403 Forbidden.

---

## Subida de comprobantes

POST /transactions/upload recibe una imagen en campo "receipt" (multipart/form-data).
Tipos aceptados: JPEG, PNG, WebP. Tamano maximo: 5 MB.
Devuelve la URL del archivo para usarla al crear o editar una transaccion.

Las imagenes se guardan localmente en la carpeta uploads/.
En produccion se migrarian a un object storage como Cloudflare R2.

---

## Arquitectura N-Layer

src/
├── routes/          -> Define los endpoints. Solo mapea URLs a controllers.
├── controllers/     -> Recibe el request, valida con Zod, llama al repository y responde.
├── repositories/    -> Unica capa que habla con la base de datos via Prisma.
├── schemas/         -> Define la forma y validacion de los datos con Zod.
├── middlewares/     -> Middleware de autenticacion JWT centralizado.
└── lib/             -> Utilidades compartidas: singleton de Prisma y helper de errores.

El middleware de autenticacion esta centralizado en middlewares/auth.middleware.ts.
El ownership check (verificar que la transaccion pertenece al usuario) esta en el controller.
El controller nunca importa Prisma directamente. El repository nunca maneja HTTP.

---

## Comandos utiles

yarn dev                               # Corre el servidor en desarrollo
yarn build                             # Compila para produccion
docker compose up -d                   # Levanta la base de datos
docker compose stop                    # Detiene la base de datos
yarn prisma studio                     # Interfaz visual de la base de datos
yarn prisma migrate dev --name nombre  # Crea una nueva migracion
yarn prisma generate                   # Genera el cliente de Prisma

---

## Uso de IA

Se utilizo Claude (Anthropic) como asistente durante el desarrollo.

Para que se uso:
- Generacion de la estructura base de cada capa
- Implementacion de autenticacion con JWT y bcrypt
- Configuracion del middleware de autenticacion en Hono
- Resolucion de errores de compatibilidad con Prisma 7 y Yarn Berry

Lo que aprendimos:
- Como separar responsabilidades en arquitectura N-Layer
- Por que el middleware de auth debe registrarse antes que las rutas con app.use()
- Por que el ownership check esta en el controller y no en el repository
- Como fluye el token desde el login hasta una request protegida
- Por que /balance y /upload deben ir antes que /:id en las rutas