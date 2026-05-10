# ev2-cashi-api-back

API REST de finanzas personales construida con arquitectura N-Layer para la Evaluacion 2 del ramo Desarrollo de Aplicaciones Web II.

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

### 4. Levantar la base de datos con Docker

Asegurate de tener Docker Desktop abierto y corriendo, luego:

docker compose up -d

### 5. Correr las migraciones

yarn prisma migrate dev --name init

### 6. Correr el servidor

yarn dev

El servidor queda corriendo en http://localhost:3000

---

## Endpoints disponibles

### Categorias

GET     /categories        Lista todas las categorias
GET     /categories/:id    Detalle de una categoria
POST    /categories        Crea una categoria
PATCH   /categories/:id    Actualiza una categoria
DELETE  /categories/:id    Elimina una categoria

### Transacciones

GET     /transactions        Lista todas las transacciones
GET     /transactions/:id    Detalle de una transaccion
POST    /transactions        Crea una transaccion
PATCH   /transactions/:id    Actualiza una transaccion
DELETE  /transactions/:id    Elimina una transaccion
GET     /transactions/balance Retorna el balance general

### Balance

GET /transactions/balance retorna:

{
  "totalIncome": 800000,
  "totalExpense": 400000,
  "balance": 400000
}

---

## Arquitectura N-Layer

src/
├── routes/          -> Define los endpoints. Solo mapea URLs a controllers.
├── controllers/     -> Recibe el request, valida con Zod, llama al repository y responde.
├── repositories/    -> Unica capa que habla con la base de datos via Prisma.
├── schemas/         -> Define la forma y validacion de los datos con Zod.
└── lib/             -> Utilidades compartidas: singleton de Prisma y helper de errores.

Cada capa tiene una sola responsabilidad. El controller nunca importa Prisma directamente. El repository nunca maneja HTTP. El balance se calcula en el controller, no en el repository.

---

## Comandos utiles

yarn dev                               # Corre el servidor en desarrollo
yarn build                             # Compila para produccion
docker compose up -d                   # Levanta la base de datos
docker compose stop                    # Detiene la base de datos
yarn prisma studio                     # Interfaz visual de la base de datos
yarn prisma migrate dev --name nombre  # Crea una nueva migracion

---

## Uso de IA

Se utilizo Claude (Anthropic) como asistente durante el desarrollo.

Para que se uso:
- Generacion de la estructura base de cada capa
- Resolucion de errores de compatibilidad con Prisma 7 y Yarn Berry
- Configuracion del driver adapter de Prisma con PostgreSQL

Lo que aprendimos:
- Como separar responsabilidades en arquitectura N-Layer
- Por que el balance debe calcularse en el controller y no en el repository
- Como funciona el patron de repositorio con interfaz como contrato irrompible
- Por que /balance debe ir antes que /:id en las rutas
