const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const saleRoutes = require('./routes/saleRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const discountRoutes = require('./routes/discountRoutes');
const pool = require('./config/db');
const { seedAdmin } = require('./seedAdmin');

const app = express();

// La API va detrás del nginx del frontend (y del proxy del servidor), así que
// req.ip debe salir de X-Forwarded-For o el rate limit contaría a todos como una sola IP.
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));
app.disable('x-powered-by');

// HSTS obliga al navegador a usar HTTPS durante un año. Activarlo mientras el sitio
// se sirve por IP sin certificado dejaría el navegador sin poder abrirlo, y la
// cabecera queda cacheada aunque se revierta. Se enciende con ENABLE_HSTS=true
// una vez que el dominio tenga certificado.
app.use(helmet({
  hsts: String(process.env.ENABLE_HSTS).toLowerCase() === 'true'
}));

// Sin CORS_ORIGIN se permite cualquier origen (cómodo en local).
// En producción hay que fijarlo al dominio real, separando varios por comas.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Freno general para toda la API.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas peticiones, intenta de nuevo más tarde' }
}));

// Freno estricto contra fuerza bruta en las rutas que crean sesión o cuentas.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 5),
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de acceso, espera unos minutos antes de reintentar' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SKULL FACE API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/discounts', discountRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query('SELECT 1');
    try {
      await seedAdmin();
    } catch (error) {
      // Una siembra fallida no debe impedir que la API arranque.
      console.error('No se pudieron crear las cuentas iniciales:', error.message);
    }
    app.listen(PORT, () => {
      console.log(`SKULL FACE API corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a MySQL al iniciar la API:', error.message);
    process.exit(1);
  }
}

startServer();
