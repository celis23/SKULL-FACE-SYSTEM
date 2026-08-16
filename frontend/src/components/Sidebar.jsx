import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: '⛶' },
  { to: '/inventory', label: 'Inventario', icon: '▦' },
  { to: '/products', label: 'Productos', icon: '◧' },
  { to: '/sales', label: 'Ventas', icon: '✕' },
  { to: '/statistics', label: 'Estadísticas', icon: '▤' },
  { to: '/users', label: 'Usuarios', icon: '◉' },
  { to: '/orders', label: 'Pedidos', icon: '□' },
  { to: '/settings', label: 'Configuración', icon: '⚙' }
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const links = user?.rol === 'recepcionista' ? [{ to: '/sales', label: 'Ventas', icon: '✕' }] : adminLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="skull-icon">☠</span>
        <div>
          <h1>SKULL FACE</h1>
          <span className="sidebar-subtitle">Sales &amp; Inventory</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-dot" />
          {user?.usuario}
        </div>
        <button className="btn-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
