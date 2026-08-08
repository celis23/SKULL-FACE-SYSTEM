const pool = require('../config/db');

async function getDailyStats() {
  const [[hoy]] = await pool.query(`
    SELECT COALESCE(SUM(total), 0) AS ventas, COALESCE(SUM(ganancia), 0) AS ganancia,
           COALESCE(COUNT(*), 0) AS numeroVentas
    FROM ventas
    WHERE DATE(fecha) = CURDATE()
  `);

  const [ultimosDias] = await pool.query(`
    SELECT DATE(fecha) AS dia, SUM(total) AS ventas, SUM(ganancia) AS ganancia
    FROM ventas
    WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE(fecha)
    ORDER BY dia ASC
  `);

  return { hoy, ultimosDias };
}

async function getWeeklyStats() {
  const [[semana]] = await pool.query(`
    SELECT COALESCE(SUM(total), 0) AS ventas, COALESCE(SUM(ganancia), 0) AS ganancia,
           COALESCE(COUNT(*), 0) AS numeroVentas
    FROM ventas
    WHERE YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)
  `);

  return { semana };
}

async function getMonthlyStats() {
  const [[mes]] = await pool.query(`
    SELECT COALESCE(SUM(total), 0) AS ventas, COALESCE(SUM(ganancia), 0) AS ganancia,
           COALESCE(COUNT(*), 0) AS numeroVentas
    FROM ventas
    WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())
  `);

  const [ultimosMeses] = await pool.query(`
    SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, SUM(total) AS ventas, SUM(ganancia) AS ganancia
    FROM ventas
    WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
    ORDER BY mes ASC
  `);

  return { mes, ultimosMeses };
}

async function getSummary() {
  const [[productosVendidos]] = await pool.query(`
    SELECT COALESCE(SUM(cantidad), 0) AS total FROM detalle_ventas
  `);

  const [[productosDisponibles]] = await pool.query(`
    SELECT COALESCE(SUM(stock), 0) AS total FROM productos
  `);

  const [productoMasVendido] = await pool.query(`
    SELECT p.nombre, SUM(dv.cantidad) AS totalVendido
    FROM detalle_ventas dv
    JOIN productos p ON dv.productoId = p.id
    GROUP BY dv.productoId
    ORDER BY totalVendido DESC
    LIMIT 1
  `);

  const [categoriaMasVendida] = await pool.query(`
    SELECT p.categoria, SUM(dv.cantidad) AS totalVendido
    FROM detalle_ventas dv
    JOIN productos p ON dv.productoId = p.id
    GROUP BY p.categoria
    ORDER BY totalVendido DESC
    LIMIT 1
  `);

  const [ventasPorMetodoPago] = await pool.query(`
    SELECT metodoPago, COUNT(*) AS numeroVentas, SUM(total) AS total
    FROM ventas
    GROUP BY metodoPago
  `);

  const [stockBajo] = await pool.query(`
    SELECT id, nombre, stock FROM productos WHERE estado = 'Stock bajo'
  `);

  const [agotados] = await pool.query(`
    SELECT id, nombre FROM productos WHERE estado = 'Agotado'
  `);

  return {
    productosVendidos: productosVendidos.total,
    productosDisponibles: productosDisponibles.total,
    productoMasVendido: productoMasVendido[0] || null,
    categoriaMasVendida: categoriaMasVendida[0] || null,
    ventasPorMetodoPago,
    stockBajo,
    agotados
  };
}

module.exports = { getDailyStats, getWeeklyStats, getMonthlyStats, getSummary };
