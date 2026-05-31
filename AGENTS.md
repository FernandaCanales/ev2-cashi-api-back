# AGENTS.md — Errores, soluciones y aprendizajes

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
