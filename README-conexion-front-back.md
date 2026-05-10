# Como conectar el backend con el frontend de Cashi

---

## Contexto

El frontend actualmente usa AsyncStorage para guardar datos en el dispositivo. Para conectarlo con este backend hay que reemplazar las llamadas a AsyncStorage por llamadas HTTP a la API.

---

## URL base de la API

Cuando usas Expo Go en tu telefono, localhost no apunta a tu computador. Debes usar tu IP local.

Para encontrar tu IP en Windows:
ipconfig
Busca "Direccion IPv4" — sera algo como 192.168.1.X

La URL base sera: http://192.168.1.X:3000

---

## Equivalencias de endpoints

Listar categorias     -> GET  /categories
Crear categoria       -> POST /categories
Editar categoria      -> PATCH /categories/:id
Eliminar categoria    -> DELETE /categories/:id
Listar transacciones  -> GET  /transactions
Crear transaccion     -> POST /transactions
Editar transaccion    -> PATCH /transactions/:id
Eliminar transaccion  -> DELETE /transactions/:id
Ver balance           -> GET  /transactions/balance

---

## Ejemplo — obtener categorias desde el front

const API_URL = 'http://192.168.1.X:3000'

const getCategories = async () => {
  const response = await fetch(`${API_URL}/categories`)
  return response.json()
}

---

## Ejemplo — crear una transaccion desde el front

const createTransaction = async (data) => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return response.json()
}

---

## Ejemplo — obtener el balance

const getBalance = async () => {
  const response = await fetch(`${API_URL}/transactions/balance`)
  return response.json()
  // { totalIncome: 800000, totalExpense: 400000, balance: 400000 }
}

---

## Orden para levantar todo

1. Abrir Docker Desktop
2. En la carpeta del backend: docker compose up -d
3. En la carpeta del backend: yarn dev
4. En la carpeta del frontend: yarn start
5. Escanear el QR con Expo Go

El backend debe estar corriendo antes de abrir la app.