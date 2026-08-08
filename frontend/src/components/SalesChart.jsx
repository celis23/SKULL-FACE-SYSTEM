import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SalesChart({ data, dataKeyX = 'dia', dataKeyY = 'ventas', height = 260 }) {
  if (!data || data.length === 0) {
    return <div className="empty-state">No hay datos suficientes para graficar.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
        <XAxis dataKey={dataKeyX} stroke="#8a8a8a" fontSize={12} tickLine={false} axisLine={{ stroke: '#2a2a2a' }} />
        <YAxis stroke="#8a8a8a" fontSize={12} tickLine={false} axisLine={{ stroke: '#2a2a2a' }} />
        <Tooltip
          contentStyle={{ background: '#111111', border: '1px solid #2e2e2e', borderRadius: 4, color: '#fff' }}
          labelStyle={{ color: '#bbbbbb' }}
        />
        <Area type="monotone" dataKey={dataKeyY} stroke="#ffffff" strokeWidth={2} fill="url(#colorVentas)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
