import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StoreNavbar({ cartCount = 0, onCartClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  function exit() { logout(); navigate('/login'); }
  return <header className="store-navbar"><NavLink to="/tienda" className="store-brand">☠ SKULL FACE <small>STORE</small></NavLink><nav><NavLink to="/tienda">Catálogo</NavLink><NavLink to="/mis-pedidos">Mis pedidos</NavLink>{onCartClick && <button className="btn-secondary store-cart" onClick={onCartClick}>Carrito {cartCount}</button>}<span>{user?.usuario}</span><button className="btn-logout store-logout" onClick={exit}>Salir</button></nav></header>;
}
