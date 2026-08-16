# SKULL FACE — Sales & Inventory

Sistema de administración de ventas e inventario para la marca de ropa **SKULL FACE**.

Stack: **React + Vite** (frontend) · **Node.js + Express** (backend) · **MySQL** (base de datos).

---

## 1. Requisitos previos

- Node.js 18 o superior instalado.
- MySQL Server instalado (con MySQL Workbench para importar el script).

---

## 2. Base de datos

1. Abre **MySQL Workbench** y conéctate a tu servidor local.
2. Ve a `File > Open SQL Script...` y selecciona el archivo `database.sql` que está en la raíz de este proyecto.
3. Ejecuta todo el script (ícono del rayo ⚡ o `Ctrl+Shift+Enter`).
4. Esto creará la base de datos `skull_face`, sus tablas, relaciones, usuarios iniciales y 3 productos de ejemplo.

Si ya tienes una instalación anterior y quieres conservar sus datos, ejecuta `migration_roles.sql` una sola vez en lugar de `database.sql`. La migración reemplaza el usuario antiguo `tlacolula`.

Usuarios iniciales:

```
administrador: celis / 111024
recepcionista: tlaco / 123tlaco
```

---

## 3. Backend (Node.js + Express)

```bash
cd backend
npm install
```

Copia el archivo de variables de entorno:

```bash
cp .env.example .env
```

Abre `.env` y ajusta según tu instalación de MySQL:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_DE_MYSQL
DB_NAME=skull_face
DB_PORT=3306

JWT_SECRET=cambia_esto_por_una_clave_secreta_larga_y_segura
JWT_EXPIRES_IN=8h
```

**Importante:** cambia `DB_PASSWORD` por la contraseña real de tu usuario `root` de MySQL (o el usuario que uses), y cambia `JWT_SECRET` por cualquier cadena larga y aleatoria.

Levanta el servidor:

```bash
npm run dev
```

El backend quedará corriendo en `http://localhost:3000`. Puedes verificar que funciona visitando `http://localhost:3000/api/health`.

---

## 4. Frontend (React + Vite)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend quedará disponible en `http://localhost:5173`.

Si tu backend corre en un puerto distinto a 3000, crea un archivo `frontend/.env` con:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 5. Uso

1. Abre `http://localhost:5173` en tu navegador.
2. Inicia sesión como `celis` / `111024` para administrar el sistema.
3. `tlaco` / `123tlaco` entra directamente a **Ventas** y no puede acceder a módulos administrativos.
4. Los clientes se registran en `/register`, compran en `/tienda` y consultan sus pedidos en `/mis-pedidos`.
5. Los pedidos se crean en estado `pendiente`; al confirmarlos desde **Pedidos**, el stock se descuenta en una transacción MySQL.

---

## 6. Estructura del proyecto

```
SKULL-FACE-SYSTEM/
├── database.sql
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/db.js
│       ├── controllers/
│       ├── middleware/auth.js
│       ├── models/
│       ├── routes/
│       └── server.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        ├── context/
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

---

## 7. Notas técnicas

- La contraseña del usuario inicial está almacenada en `database.sql` con hash **bcrypt** real (10 salt rounds), nunca en texto plano.
- El login se valida completamente en el backend (`POST /api/auth/login`), no en el frontend.
- El JWT incluye `id`, `usuario` y `rol`; la API valida permisos con roles, no solo el frontend.
- `/api/auth/login` y `/api/auth/register` son públicas. El registro público siempre crea usuarios con rol `cliente`.
- El catálogo público autenticado (`/api/catalog`) nunca devuelve costo ni ganancias.
- Al registrar una venta, el backend usa una transacción de MySQL: si algo falla, no se descuenta stock ni se guarda nada a medias.
- El estado de cada producto (`Disponible`, `Stock bajo`, `Agotado`) se recalcula automáticamente según el stock (stock bajo ≤ 5 unidades, agotado = 0).
