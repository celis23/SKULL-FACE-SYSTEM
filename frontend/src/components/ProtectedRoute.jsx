import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="pixel-loader">SKULL FACE</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    const destination = user?.rol === 'cliente' ? '/tienda' : user?.rol === 'recepcionista' ? '/sales' : '/';
    return <Navigate to={destination} replace />;
  }

  return children;
}
