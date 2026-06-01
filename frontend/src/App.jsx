import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/ClientesPage';
import { QuartosPage } from './pages/QuartosPage';
import { ReservasPage } from './pages/ReservasPage';
import { CheckInPage } from './pages/CheckInPage';
import { CheckOutPage } from './pages/CheckOutPage';
import { ConsumosPage } from './pages/ConsumosPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { FuncionariosPage } from './pages/FuncionariosPage';

function GerenteRoute({ children }) {
  const { user, isGerente } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isGerente) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="quartos" element={<QuartosPage />} />
            <Route path="reservas" element={<ReservasPage />} />
            <Route path="checkin" element={<CheckInPage />} />
            <Route path="checkout" element={<CheckOutPage />} />
            <Route path="consumos" element={<ConsumosPage />} />
            <Route path="relatorios" element={<GerenteRoute><RelatoriosPage /></GerenteRoute>} />
            <Route path="funcionarios" element={<GerenteRoute><FuncionariosPage /></GerenteRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
