import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="page">
      <Navbar title="Configuración" subtitle="Datos de la cuenta" />

      <div className="panel">
        <h3>Cuenta</h3>
        <div className="settings-row">
          <span>Usuario</span>
          <span>{user?.usuario}</span>
        </div>
        <div className="settings-row">
          <span>Marca</span>
          <span>SKULL FACE</span>
        </div>
        <div className="settings-row">
          <span>Sistema</span>
          <span>Sales &amp; Inventory v1.0</span>
        </div>
      </div>
    </div>
  );
}
