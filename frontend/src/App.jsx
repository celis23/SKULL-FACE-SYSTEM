import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Register from './pages/Register';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Catalog from './pages/Catalog';
import MyOrders from './pages/MyOrders';

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-content">{children}</main>
    </div>
  );
}

function LoginRoute() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    window.location.href = user?.rol === 'cliente' ? '/tienda' : user?.rol === 'recepcionista' ? '/sales' : '/';
    return null;
  }
  return <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AppLayout>
                  <Inventory />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AppLayout>
                  <Products />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={['administrador', 'recepcionista']}>
                <AppLayout>
                  <Sales />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/statistics"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AppLayout>
                  <Statistics />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['administrador']}><AppLayout><Users /></AppLayout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['administrador']}><AppLayout><Orders /></AppLayout></ProtectedRoute>} />
          <Route path="/tienda" element={<ProtectedRoute allowedRoles={['cliente']}><Catalog /></ProtectedRoute>} />
          <Route path="/mis-pedidos" element={<ProtectedRoute allowedRoles={['cliente']}><MyOrders /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
