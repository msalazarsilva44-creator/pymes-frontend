import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import RequireAuth from './components/RequireAuth'
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

function App() {

  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/empresa/:id" element={<EmpresaDetail />} />
        <Route path="/cliente/perfil" element={<RequireAuth role="cliente"><ClientePerfil /></RequireAuth>} />
        <Route path="/dashboard/empresa" element={<RequireAuth role="empresa"><DashboardEmpresa /></RequireAuth>} />
        <Route path="/dashboard/empresa/productos" element={<RequireAuth role="empresa"><Productos /></RequireAuth>} />
        <Route path="/dashboard/empresa/metricas" element={<RequireAuth role="empresa"><Metricas /></RequireAuth>} />
        <Route path="/dashboard/empresa/perfil" element={<RequireAuth role="empresa"><EditarPerfil /></RequireAuth>} />
        <Route path="/dashboard/empresa/ventas" element={<RequireAuth role="empresa"><Ventas /></RequireAuth>} />
        <Route path="/dashboard/empresa/resenas" element={<RequireAuth role="empresa"><Resenas /></RequireAuth>} />
        <Route path="/dashboard/empresa/galeria" element={<Navigate to="/dashboard/empresa/servicios" replace />} />
        <Route path="/dashboard/empresa/horarios" element={<RequireAuth role="empresa"><Horarios /></RequireAuth>} />
        <Route path="/dashboard/empresa/pagos" element={<RequireAuth role="empresa"><MetodosPago /></RequireAuth>} />
        <Route path="/dashboard/empresa/servicios" element={<RequireAuth role="empresa"><Servicios /></RequireAuth>} />
        <Route path="/dashboard/empresa/productos/ingreso" element={<RequireAuth role="empresa"><IngresoMercancia /></RequireAuth>} />
        <Route path="/dashboard/empresa/reportes" element={<RequireAuth role="empresa"><Reportes /></RequireAuth>} />
        <Route path="/dashboard/empresa/reportes/ventas" element={<RequireAuth role="empresa"><ReporteVentas /></RequireAuth>} />
        <Route path="/dashboard/empresa/reportes/ingresos" element={<RequireAuth role="empresa"><IngresosPorDia /></RequireAuth>} />
        <Route path="/dashboard/empresa/solicitar-plan" element={<RequireAuth role="empresa"><SolicitarPlan /></RequireAuth>} />
        <Route path="/carrito" element={<RequireAuth role="cliente"><Carrito /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth role="cliente"><Checkout /></RequireAuth>} />
        <Route path="/mis-ordenes" element={<RequireAuth role="cliente"><MisOrdenes /></RequireAuth>} />
        <Route path="/mis-ordenes/:id" element={<RequireAuth role="cliente"><OrdenDetail /></RequireAuth>} />
      </Routes>
      <CartDrawer />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
