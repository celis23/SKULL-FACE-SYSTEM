import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ nombreCompleto: '', email: '', telefono: '', usuario: '', password: '' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const { register } = useAuth(); const navigate = useNavigate();
  async function submit(e) { e.preventDefault(); setError(''); setLoading(true); try { await register(form); navigate('/tienda'); } catch (err) { setError(err.response?.data?.message || 'No se pudo crear la cuenta'); } finally { setLoading(false); } }
  return <div className="login-screen"><div className="login-card"><div className="login-brand"><span className="skull-icon skull-icon-lg">☠</span><h1>SKULL FACE</h1><p>Registro de cliente</p></div><form className="login-form" onSubmit={submit}>
    <label>Nombre completo<input required value={form.nombreCompleto} onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })} /></label>
    <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
    <label>Teléfono <small>(opcional)</small><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></label>
    <label>Usuario<input required value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} /></label>
    <label>Contraseña<input type="password" minLength="6" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
    {error && <p className="form-error">{error}</p>}<button className="btn-primary btn-block" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
  </form><p className="login-register-link">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p></div></div>;
}
