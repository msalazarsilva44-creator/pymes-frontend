import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import RequireAuth from './components/RequireAuth'
import RequireActiveSubscription from './components/Auth/RequireActiveSubscription'
import { SubscriptionAlertProvider } from './components/Auth/SubscriptionAlertProvider'
import PagoEnRevision from './pages/PagoEnRevision'
import Landing from './pages/Landing.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Marketplace from './pages/Marketplace.tsx'
import EmpresaDetail from './pages/EmpresaDetail.tsx'
import DashboardEmpresa from './pages/DashboardEmpresa'
import Productos from './pages/Productos'
import Metricas from './pages/Metricas'
import EditarPerfil from './pages/EditarPerfil'
import Ventas from './pages/Ventas'
import Resenas from './pages/Resenas'
import Horarios from './pages/Horarios'
import MetodosPago from './pages/MetodosPago'
import Servicios from './pages/Servicios'
import Reportes from './pages/Reportes'
import ReporteVentas from './pages/ReporteVentas'
import IngresosPorDia from './pages/IngresosPorDia'
import IngresoMercancia from './pages/IngresoMercancia'
import SolicitarPlan from './pages/SolicitarPlan'
import ClientePerfil from './pages/ClientePerfil'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import MisOrdenes from './pages/MisOrdenes'
import OrdenDetail from './pages/OrdenDetail'
import CartDrawer from './components/CartDrawer'
import SuscripcionVencida from './pages/SuscripcionVencida'

/**
 * Ruta de empresa que exige suscripción activa: autenticación + guard de
 * suscripción. Las pantallas de pago / "en revisión" / vencida NO usan este
 * wrapper para evitar bucles de redirección.
 */
function EmpresaActive({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="empresa">
      <RequireActiveSubscription>{children}</RequireActiveSubscription>
    </RequireAuth>
  )
}

function App() {

  return (
    <AuthProvider>
      <CartProvider>
        <SubscriptionAlertProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/empresa/:id" element={<EmpresaDetail />} />
            <Route path="/cliente/perfil" element={<RequireAuth role="cliente"><ClientePerfil /></RequireAuth>} />

            {/* Rutas accesibles para empresa autenticada SIN suscripción activa (fuera del guard) */}
            <Route path="/suscripcion-vencida" element={<RequireAuth role="empresa"><SuscripcionVencida /></RequireAuth>} />
            <Route path="/dashboard/empresa/solicitar-plan" element={<RequireAuth role="empresa"><SolicitarPlan /></RequireAuth>} />
            <Route path="/dashboard/empresa/pago-en-revision" element={<RequireAuth role="empresa"><PagoEnRevision /></RequireAuth>} />

            {/* Rutas que EXIGEN suscripción activa */}
            <Route path="/dashboard/empresa" element={<EmpresaActive><DashboardEmpresa /></EmpresaActive>} />
            <Route path="/dashboard/empresa/productos" element={<EmpresaActive><Productos /></EmpresaActive>} />
            <Route path="/dashboard/empresa/metricas" element={<EmpresaActive><Metricas /></EmpresaActive>} />
            <Route path="/dashboard/empresa/perfil" element={<EmpresaActive><EditarPerfil /></EmpresaActive>} />
            <Route path="/dashboard/empresa/ventas" element={<EmpresaActive><Ventas /></EmpresaActive>} />
            <Route path="/dashboard/empresa/resenas" element={<EmpresaActive><Resenas /></EmpresaActive>} />
            <Route path="/dashboard/empresa/galeria" element={<Navigate to="/dashboard/empresa/servicios" replace />} />
            <Route path="/dashboard/empresa/horarios" element={<EmpresaActive><Horarios /></EmpresaActive>} />
            <Route path="/dashboard/empresa/pagos" element={<EmpresaActive><MetodosPago /></EmpresaActive>} />
            <Route path="/dashboard/empresa/servicios" element={<EmpresaActive><Servicios /></EmpresaActive>} />
            <Route path="/dashboard/empresa/productos/ingreso" element={<EmpresaActive><IngresoMercancia /></EmpresaActive>} />
            <Route path="/dashboard/empresa/reportes" element={<EmpresaActive><Reportes /></EmpresaActive>} />
            <Route path="/dashboard/empresa/reportes/ventas" element={<EmpresaActive><ReporteVentas /></EmpresaActive>} />
            <Route path="/dashboard/empresa/reportes/ingresos" element={<EmpresaActive><IngresosPorDia /></EmpresaActive>} />

            <Route path="/carrito" element={<RequireAuth role="cliente"><Carrito /></RequireAuth>} />
            <Route path="/checkout" element={<RequireAuth role="cliente"><Checkout /></RequireAuth>} />
            <Route path="/mis-ordenes" element={<RequireAuth role="cliente"><MisOrdenes /></RequireAuth>} />
            <Route path="/mis-ordenes/:id" element={<RequireAuth role="cliente"><OrdenDetail /></RequireAuth>} />
          </Routes>
          <CartDrawer />
        </SubscriptionAlertProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
