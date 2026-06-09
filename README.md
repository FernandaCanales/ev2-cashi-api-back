Aquí va el README completo con la sección nueva agregada al final:
markdown# ev2-cashi-api-back

API REST de finanzas personales construida con arquitectura N-Layer para la Evaluación 2 y 3 del ramo Desarrollo de Aplicaciones Web II.

## Videos demostrativos

- Evaluación 2: https://youtu.be/iYWxGRk_LTI
- Evaluación 3: https://youtu.be/yONMV4rf6Mw
- Examen Final: (pendiente — agregar al subir video)

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
- Cloudflare R2

---

## Requisitos previos

- Node.js instalado
- Yarn instalado
- Docker Desktop instalado y corriendo

---

## Cómo instalar y levantar el proyecto

### 1. Clonar el repositorio
git clone https://github.com/FernandaCanales/ev2-cashi-api-back.git
cd ev2-cashi-api-back

### 2. Instalar dependencias
yarn install

### 3. Crear el archivo .env

Crea un archivo `.env` en la raíz del proyecto con este contenido:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cashidb"
JWT_SECRET="cashi-super-secret-key-cambiar-en-produccion-2026"
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_ENDPOINT=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""

### 4. Levantar la base de datos con Docker
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

### Autenticación (pública — no requiere token)
POST    /auth/register     Crea una cuenta. Devuelve un JWT.
POST    /auth/login        Inicia sesión. Devuelve un JWT.

### Categorías (requiere token)
GET     /categories        Lista todas las categorías
GET     /categories/:id    Detalle de una categoría
POST    /categories        Crea una categoría
PATCH   /categories/:id    Actualiza una categoría
DELETE  /categories/:id    Elimina una categoría

### Transacciones (requiere token)
GET     /transactions              Lista las transacciones del usuario autenticado
GET     /transactions/balance      Balance del usuario autenticado
GET     /transactions/:id          Detalle de una transacción
POST    /transactions              Crea una transacción (userId se toma del token)
PATCH   /transactions/:id          Actualiza una transacción (solo si es el dueño)
DELETE  /transactions/:id          Elimina una transacción (solo si es el dueño)
POST    /transactions/upload       Sube un comprobante a Cloudflare R2, devuelve la URL

---

## Autenticación

Todas las rutas excepto `/auth/register` y `/auth/login` requieren un JWT válido en el header:
Authorization: Bearer TU_TOKEN

Si no se envía el token o es inválido, la API responde `401 Unauthorized`.
Si se intenta editar o eliminar una transacción de otro usuario, responde `403 Forbidden`.

---

## Subida de comprobantes

`POST /transactions/upload` recibe una imagen en el campo `receipt` (multipart/form-data).
Tipos aceptados: JPEG, PNG, WebP. Tamaño máximo: 5 MB.
Devuelve la URL pública del archivo en Cloudflare R2 para usarla al crear o editar una transacción.

---

## Despliegue en producción

**URL pública:** https://ev2-cashi-api-back.onrender.com

**Plataforma:** Render (Free tier)

**Base de datos en producción:** PostgreSQL gestionado en Render

**Almacenamiento de comprobantes:** Cloudflare R2

---

## Examen Final — Despliegue en Render con Cloudflare R2

### Qué cambió respecto a la Evaluación 3

| | Evaluación 3 | Examen Final |
|---|---|---|
| Almacenamiento de comprobantes | Filesystem local (`uploads/`) | Cloudflare R2 (nube) |
| Base de datos | Docker local | PostgreSQL gestionado en Render |
| Acceso | Solo local | URL pública en internet |
| packageManager | yarn@4.14.1 | Eliminado para compatibilidad con Render |

### Por qué se migró a Cloudflare R2

Render usa un filesystem efímero — los archivos guardados localmente se pierden en cada nuevo deploy. Cloudflare R2 es almacenamiento de objetos persistente en la nube, compatible con el protocolo S3 de Amazon, con 10 GB gratuitos al mes y sin cargos de salida.

### Cómo funciona la subida de comprobantes con R2

1. El cliente envía la imagen al endpoint `POST /transactions/upload`
2. El backend valida tipo y tamaño del archivo
3. Se genera un nombre único con `randomUUID()`
4. El archivo se sube a R2 usando `@aws-sdk/client-s3` con `PutObjectCommand`
5. Se devuelve la URL pública del archivo (`R2_PUBLIC_URL/filename`)
6. Esa URL se guarda en el campo `receiptUrl` de la transacción

### Variables de entorno requeridas en Render

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Internal Database URL de Render |
| `JWT_SECRET` | Clave segura generada con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `R2_ACCESS_KEY_ID` | Access Key ID del token de Cloudflare R2 |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key del token de Cloudflare R2 |
| `R2_ENDPOINT` | Endpoint S3 de la cuenta de Cloudflare |
| `R2_BUCKET_NAME` | Nombre del bucket en R2 |
| `R2_PUBLIC_URL` | URL pública del bucket habilitada en R2 |
| `YARN_VERSION` | 4.14.1 |

### Build Command en Render
npm install && npx prisma generate && npm run build

### Start Command en Render
node dist/index.mjs

### Migraciones en producción

Las migraciones se aplicaron desde local apuntando a la base de datos de Render:
$env:DATABASE_URL="postgresql://..."
yarn prisma migrate deploy

### Uso de IA

Se utilizó Claude (Anthropic) como asistente para el despliegue.

Para qué se usó:
- Migración del almacenamiento local a Cloudflare R2
- Configuración del bucket, acceso público y API token en Cloudflare
- Resolución de errores de compatibilidad de Yarn en Render
- Configuración de variables de entorno en Render
- Aplicación de migraciones en producción

---

## Arquitectura N-Layer
src/
├── routes/          -> Define los endpoints. Solo mapea URLs a controllers.
├── controllers/     -> Recibe el request, valida con Zod, llama al repository y responde.
├── repositories/    -> Única capa que habla con la base de datos vía Prisma.
├── schemas/         -> Define la forma y validación de los datos con Zod.
├── middlewares/     -> Middleware de autenticación JWT centralizado.
└── lib/             -> Utilidades compartidas: singleton de Prisma y helper de errores.

---

## Comandos útiles
yarn dev                               # Corre el servidor en desarrollo
yarn build                             # Compila para producción
docker compose up -d                   # Levanta la base de datos
docker compose stop                    # Detiene la base de datos
yarn prisma studio                     # Interfaz visual de la base de datos
yarn prisma migrate dev --name nombre  # Crea una nueva migración
yarn prisma generate                   # Genera el cliente de Prisma
yarn prisma migrate deploy             # Aplica migraciones en producción


Ahora el AGENTS.md completo con los errores nuevos agregados al final:
markdown# AGENTS.md — Errores, soluciones y aprendizajes

---

## Error 1 — && no funciona en PowerShell

Cuando aparece: Al intentar combinar dos comandos con && en Warp usando PowerShell.

Error:
El token '&&' no es un separador de instrucciones valido en esta version.

Causa: PowerShell no usa && como separador de comandos. Eso es sintaxis de bash/Linux.

Solucion: Correr los comandos por separado, uno por uno con Enter entre cada uno.

Leccion: Warp en Windows usa PowerShell por defecto. Los comandos de bash no siempre funcionan igual.

---

## Error 2 — Docker Desktop no estaba abierto

Cuando aparece: Al correr docker compose up -d sin tener Docker Desktop abierto.

Error:
unable to get image 'postgres:16': failed to connect to docker API

Causa: Docker Desktop debe estar corriendo antes de usar cualquier comando de Docker.

Solucion: Abrir Docker Desktop desde el menu inicio, esperar a que cargue completamente y luego correr el comando.

Leccion: Siempre abrir Docker Desktop primero. Es un prerequisito que debe mencionarse al inicio.

---

## Error 3 — docker-compose.yml creado dentro de prisma/

Cuando aparece: Al crear el archivo con la carpeta prisma/ seleccionada en VS Code.

Causa: VS Code crea los archivos dentro de la carpeta que esta seleccionada en el explorador.

Solucion: Crear el archivo desde Warp con New-Item docker-compose.yml estando en la raiz, o hacer clic en un espacio vacio del explorador antes de crear el archivo.

Leccion: Siempre verificar que ninguna carpeta este seleccionada antes de crear archivos en la raiz.

---

## Error 4 — Prisma no encuentra el schema-engine binary

Cuando aparece: Al correr yarn prisma migrate dev con Yarn Berry en modo PnP.

Error:
Error: Schema engine exited. Could not find schema-engine binary.

Causa: Yarn Berry con PnP no desempaqueta correctamente los binarios nativos de Prisma.

Solucion:
yarn config set nodeLinker node-modules
yarn install
yarn prisma migrate dev --name init

Leccion: Prisma 7 con Yarn Berry requiere nodeLinker node-modules.

---

## Error 5 — Path incorrecto del cliente generado de Prisma

Cuando aparece: Al importar desde generated/prisma/client/index.js

Error en VS Code:
No se encuentra el modulo "../../generated/prisma/client/index.js"

Causa: El cliente generado por Prisma 7 no tiene index.js — el archivo principal se llama client.js.

Solucion: Cambiar todos los imports de:
from '../../generated/prisma/client/index.js'
a:
from '../../generated/prisma/client/client.js'

Archivos afectados:
- src/lib/prisma.ts
- src/lib/prisma-errors.ts
- src/repositories/categories.repository.ts
- src/repositories/transactions.repository.ts

Leccion: Los errores rojos de TypeScript no deben ignorarse. Siempre resolver los errores antes de continuar.

---

## Error 6 — tsconfig.json con error por prisma.config.ts fuera de rootDir

Causa: rootDir estaba apuntando a src/ pero prisma.config.ts vive en la raiz.

Solucion: Cambiar rootDir de "src" a "." en tsconfig.json.

Leccion: Cuando se incluyen archivos fuera de src/ en el tsconfig, rootDir debe apuntar a la raiz.

---

## Error 7 — /balance interceptado por /:id

Causa: Si /:id se define antes que /balance, Hono interpreta "balance" como un id.

Solucion: Siempre definir /balance antes que /:id en el router:

transactionsRouter.get('/balance', getBalance)
transactionsRouter.get('/:id', getTransactionById)

Leccion: El orden de las rutas importa. Las rutas especificas siempre van antes que las dinamicas.

---

## Error 8 — app.use() registrado después de app.route()

Cuando aparece: El middleware de auth no se aplica aunque el token sea válido.

Síntoma: c.get('userId') devuelve undefined aunque el token sea correcto.

Causa: Hono aplica los middlewares en el orden en que se registran. Si app.route() va antes que app.use(), las requests llegan al controller sin pasar por el middleware.

Solución: Siempre registrar app.use() ANTES que app.route() para las rutas protegidas.

Lección: El orden de registro en Hono importa tanto para rutas como para middlewares.

---

## Error 9 — receiptUrl con ruta relativa falla validación de Zod

Cuando aparece: Al enviar "/uploads/archivo.jpg" en el campo receiptUrl.

Error: Invalid URL

Causa: Zod valida que sea una URL completa con protocolo (http:// o https://).

Solución: Enviar la URL completa: "http://localhost:3000/uploads/archivo.jpg"

Lección: z.string().url() exige URLs completas con protocolo.

---

## Error 10 — prisma migrate falla si Docker no está corriendo

Cuando aparece: Al correr yarn prisma migrate dev sin tener Docker Desktop abierto.

Error:
Can't reach database server at localhost:5432

Causa: Prisma intenta conectarse a PostgreSQL, pero el contenedor no está corriendo
porque Docker Desktop no estaba iniciado.

Solución: Abrir Docker Desktop, esperar a que cargue y correr docker compose up -d
antes de cualquier comando de Prisma.

Lección: Prisma no falla por ser Prisma — falla porque no hay base de datos a la cual
conectarse. Desarrollar este tipo de aplicaciones requiere entender cómo interactúan
todas las herramientas del entorno: si Docker no corre, PostgreSQL no corre,
y si PostgreSQL no corre, Prisma no puede hacer nada.

---

## Error 11 — VARIABLE="valor" comando no funciona en PowerShell

Cuando aparece: Al intentar pasar variables de entorno inline en Warp/PowerShell.

Error:
El término 'DATABASE_URL=postgresql://...' no se reconoce como nombre de un cmdlet.

Causa: La sintaxis VARIABLE="valor" comando es de bash/Linux. PowerShell no la soporta.

Solución: Declarar la variable primero y luego correr el comando por separado:
$env:DATABASE_URL="postgresql://..."
yarn prisma migrate deploy

Lección: En PowerShell las variables de entorno temporales se declaran con $env:NOMBRE="valor".

---

## Error 12 — Render no puede instalar Yarn 4 globalmente

Cuando aparece: Al intentar usar corepack o npm install -g yarn@4.14.1 en el Build Command de Render.

Errores:
- EROFS: read-only file system, unlink '/usr/bin/npm'
- No matching version found for yarn@4.14.1

Causa: El filesystem de Render es de solo lectura en los directorios del sistema.
No se pueden instalar paquetes globales durante el build.
Además, npm no encontraba yarn@4.14.1 como versión válida en su registro.

Solución: Eliminar el campo "packageManager": "yarn@4.14.1" del package.json
y usar npm directamente en el Build Command:
npm install && npx prisma generate && npm run build

Lección: En producción no siempre se puede usar el mismo gestor de paquetes que en desarrollo.
Lo importante es que el resultado del build sea el mismo. Render usa npm por defecto
y funciona perfectamente para construir el proyecto.

---

## Error 13 — tsdown genera .mjs pero el Start Command apuntaba a .js

Cuando aparece: Al intentar arrancar el servidor en Render después del build.

Error:
Cannot find module '/opt/render/project/src/dist/index.js'

Causa: tsdown con format: ['esm'] genera index.mjs, no index.js.
El Start Command y el campo "main" del package.json apuntaban a dist/index.js.

Solución: Cambiar el Start Command en Render a:
node dist/index.mjs

Y actualizar el package.json:
"start": "node dist/index.mjs"

Lección: El formato de salida del bundler determina la extensión del archivo generado.
ESM produce .mjs, CommonJS produce .js. Siempre verificar qué genera el bundler antes de configurar el Start Command.

---

## Lo que aprendimos unidad 2

- La arquitectura N-Layer separa responsabilidades: cada capa hace solo lo suyo.
- El repository es el unico que habla con Prisma. El controller nunca importa Prisma directamente.
- El balance se calcula en el controller, no en el repository.
- La interfaz del repository es un contrato irrompible.
- Los errores rojos de TypeScript hay que resolverlos, no ignorarlos.
- Docker Desktop debe estar abierto antes de cualquier comando docker.
- El orden de las rutas en Hono importa.
- Con Prisma 7 y Yarn Berry se necesita nodeLinker node-modules.

## Lo que aprendimos en la Unidad 3

- Las contraseñas nunca se guardan en texto plano — siempre se hashean con bcrypt.
- El JWT permite identificar al usuario en cada request sin guardar estado en el servidor.
- El middleware de autenticación debe estar centralizado, no duplicado en cada ruta.
- El ownership check (verificar que la transacción pertenece al usuario) va en el controller, no en el repository.
- app.use() siempre antes de app.route() en Hono para que el middleware se aplique.
- /upload y /balance deben ir antes que /:id en las rutas.
- Un mismo error de credenciales debe devolver el mismo mensaje para usuario inexistente y contraseña incorrecta — no le digas al atacante cuál falló.

## Lo que aprendimos en el Examen Final

- El filesystem de Render es efímero — los archivos guardados localmente se pierden en cada deploy. Para persistir archivos se necesita almacenamiento externo como Cloudflare R2.
- Cloudflare R2 es compatible con el protocolo S3 de Amazon. Se integra con @aws-sdk/client-s3 usando region: 'auto' y el endpoint de la cuenta de Cloudflare.
- Para subir un archivo a R2 se usa PutObjectCommand con el bucket, el nombre del archivo (Key), el contenido binario (Body) y el tipo MIME (ContentType).
- La URL pública del archivo se construye concatenando R2_PUBLIC_URL con el nombre del archivo generado con randomUUID().
- En producción no siempre se puede usar el mismo gestor de paquetes que en desarrollo. Lo importante es que el build produzca el mismo resultado.
- Las migraciones en producción se aplican con prisma migrate deploy, no con prisma migrate dev. La diferencia es que deploy no crea migraciones nuevas — solo aplica las existentes.
- En PowerShell las variables de entorno temporales se declaran con $env:NOMBRE="valor" antes del comando, no inline como en bash.
- El campo "packageManager" en package.json le indica a Node.js qué gestor usar. En 