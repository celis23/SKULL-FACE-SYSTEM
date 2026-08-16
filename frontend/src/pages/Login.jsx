import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!usuario || !password) {
      setError('Ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const data = await login(usuario, password);
      navigate(data.user.rol === 'cliente' ? '/tienda' : data.user.rol === 'recepcionista' ? '/sales' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="skull-icon skull-icon-lg">☠</span>
          <h1>SKULL FACE</h1>
          <p>Sales &amp; Inventory System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Usuario
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="celis"
              autoComplete="username"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="login-register-link">¿Eres cliente? <a href="/register">Crea tu cuenta</a></p>
      </div>
    </div>
  );
}
