import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import { getDailyStats, getWeeklyStats, getMonthlyStats, getSummary } from '../services/statisticsService';

const money = (v) => `$${Number(v || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Dashboard() {
  const [daily, setDaily] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [d, w, m, s] = await Promise.all([
          getDailyStats(),
          getWeeklyStats(),
          getMonthlyStats(),
          getSummary()
        ]);
        setDaily(d);
        setWeekly(w);
        setMonthly(m);
        setSummary(s);
      } catch (error) {
        console.error('Error al cargar el dashboard', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const chartData = (daily?.ultimosDias || []).map((d) => ({
    dia: new Date(d.dia).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    ventas: Number(d.ventas)
  }));

  return (
    <div className="page">
      <Navbar title="Dashboard" subtitle="Resumen general de SKULL FACE" />

      {loading ? (
        <div className="empty-state">Cargando información...</div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="VENTAS HOY" value={money(daily?.hoy?.ventas)} accent="light" />
            <StatCard label="VENTAS SEMANA" value={money(weekly?.semana?.ventas)} />
            <StatCard label="VENTAS MES" value={money(monthly?.mes?.ventas)} />
            <StatCard label="GANANCIA HOY" value={money(daily?.hoy?.ganancia)} />
            <StatCard label="GANANCIA MES" value={money(monthly?.mes?.ganancia)} />
            <StatCard label="PRODUCTOS VENDIDOS" value={summary?.productosVendidos ?? 0} />
            <StatCard label="INVENTARIO" value={`${summary?.productosDisponibles ?? 0} PRENDAS`} accent="light" />
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Ventas de los últimos días</h3>
            </div>
            <SalesChart data={chartData} />
          </div>

          <div className="grid-2">
            <div className="panel">
              <h3>Más vendido</h3>
              <p className="panel-highlight">
                {summary?.productoMasVendido?.nombre || 'Sin datos aún'}
              </p>
              <span className="panel-subtext">
                {summary?.productoMasVendido ? `${summary.productoMasVendido.totalVendido} unidades` : ''}
              </span>
            </div>
            <div className="panel">
              <h3>Categoría más vendida</h3>
              <p className="panel-highlight">
                {summary?.categoriaMasVendida?.categoria || 'Sin datos aún'}
              </p>
              <span className="panel-subtext">
                {summary?.categoriaMasVendida ? `${summary.categoriaMasVendida.totalVendido} unidades` : ''}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
