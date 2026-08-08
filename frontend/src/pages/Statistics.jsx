import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import { getDailyStats, getMonthlyStats, getSummary } from '../services/statisticsService';

const money = (v) => `$${Number(v || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Statistics() {
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [d, m, s] = await Promise.all([getDailyStats(), getMonthlyStats(), getSummary()]);
        setDaily(d);
        setMonthly(m);
        setSummary(s);
      } catch (error) {
        console.error('Error al cargar estadísticas', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const dailyChartData = (daily?.ultimosDias || []).map((d) => ({
    dia: new Date(d.dia).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    ventas: Number(d.ventas)
  }));

  const monthlyChartData = (monthly?.ultimosMeses || []).map((m) => ({
    dia: m.mes,
    ventas: Number(m.ventas)
  }));

  return (
    <div className="page">
      <Navbar title="Estadísticas" subtitle="Análisis de ventas y ganancias" />

      {loading ? (
        <div className="empty-state">Cargando estadísticas...</div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="GANANCIA HOY" value={money(daily?.hoy?.ganancia)} />
            <StatCard label="GANANCIA MES" value={money(monthly?.mes?.ganancia)} />
            <StatCard label="PRODUCTOS VENDIDOS" value={summary?.productosVendidos ?? 0} />
            <StatCard label="MÁS VENDIDO" value={summary?.productoMasVendido?.nombre || '—'} />
          </div>

          <div className="panel">
            <h3>Ventas diarias (últimos 7 días)</h3>
            <SalesChart data={dailyChartData} />
          </div>

          <div className="panel">
            <h3>Ventas mensuales (últimos meses)</h3>
            <SalesChart data={monthlyChartData} />
          </div>

          <div className="grid-2">
            <div className="panel">
              <h3>Ventas por método de pago</h3>
              {summary?.ventasPorMetodoPago?.length ? (
                <ul className="simple-list">
                  {summary.ventasPorMetodoPago.map((m) => (
                    <li key={m.metodoPago}>
                      <span>{m.metodoPago}</span>
                      <span>{money(m.total)} ({m.numeroVentas})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">Sin datos aún.</div>
              )}
            </div>

            <div className="panel">
              <h3>Categoría más vendida</h3>
              <p className="panel-highlight">{summary?.categoriaMasVendida?.categoria || 'Sin datos aún'}</p>
              <span className="panel-subtext">
                {summary?.categoriaMasVendida ? `${summary.categoriaMasVendida.totalVendido} unidades` : ''}
              </span>
            </div>
          </div>

          <div className="grid-2">
            <div className="panel">
              <h3>Productos con poco stock</h3>
              {summary?.stockBajo?.length ? (
                <ul className="simple-list">
                  {summary.stockBajo.map((p) => (
                    <li key={p.id}>
                      <span>{p.nombre}</span>
                      <span>{p.stock} unidades</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">No hay productos con stock bajo.</div>
              )}
            </div>

            <div className="panel">
              <h3>Productos agotados</h3>
              {summary?.agotados?.length ? (
                <ul className="simple-list">
                  {summary.agotados.map((p) => (
                    <li key={p.id}>
                      <span>{p.nombre}</span>
                      <span className="badge badge-danger">Agotado</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">No hay productos agotados.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
