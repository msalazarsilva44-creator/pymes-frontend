import { useState, useCallback, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBackButtonGuard } from '../hooks/useBackButtonGuard'
import BackButtonModal from './BackButtonModal'
import {
  LayoutDashboard,
  Package,
  Wrench,
  BarChart3,
  ShoppingBag,
  MessageSquare,
  Clock,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  ChevronDown,
  Lock,
  FileBarChart,
  ShoppingCart,
  Wallet,
  PackagePlus,
} from 'lucide-react'

type NavChild = {
  to: string
  icon: typeof LayoutDashboard
  label: string
}

type NavItem = {
  to: string
  icon: typeof LayoutDashboard
  label: string
  /** Si está definido, requiere que ese módulo esté activo en la empresa. */
  requiresModule?: 'products' | 'services'
  /** Si es true, requiere que la empresa esté aprobada. Por defecto: true (excepto Dashboard y Perfil). */
  requiresApproval?: boolean
  /** Sub-items para acordeón */
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { to: '/dashboard/empresa', icon: LayoutDashboard, label: 'Dashboard', requiresApproval: false },
  { to: '/dashboard/empresa/productos', icon: Package, label: 'Productos', requiresModule: 'products', children: [
    { to: '/dashboard/empresa/productos', icon: Package, label: 'Catálogo' },
    { to: '/dashboard/empresa/productos/ingreso', icon: PackagePlus, label: 'Ingreso de Mercancía' },
  ] },
  { to: '/dashboard/empresa/servicios', icon: Wrench, label: 'Servicios', requiresModule: 'services' },
  { to: '/dashboard/empresa/ventas', icon: ShoppingBag, label: 'Ventas' },
  { to: '/dashboard/empresa/metricas', icon: BarChart3, label: 'Métricas' },
  { to: '/dashboard/empresa/reportes', icon: FileBarChart, label: 'Reportes', children: [
    { to: '/dashboard/empresa/reportes', icon: FileBarChart, label: 'General' },
    { to: '/dashboard/empresa/reportes/ventas', icon: ShoppingCart, label: 'Reporte de Ventas' },
    { to: '/dashboard/empresa/reportes/ingresos', icon: Wallet, label: 'Ingresos por Día' },
  ] },
  { to: '/dashboard/empresa/resenas', icon: MessageSquare, label: 'Reseñas' },
  { to: '/dashboard/empresa/horarios', icon: Clock, label: 'Horarios' },
  { to: '/dashboard/empresa/pagos', icon: CreditCard, label: 'Métodos de Pago' },
  { to: '/dashboard/empresa/perfil', icon: Settings, label: 'Editar Perfil', requiresApproval: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, empresa, logout, refreshEmpresa } = useAuth()
  const location = useLocation()
  const [showExitModal, setShowExitModal] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const isApproved = empresa?.status === 'aprobado'
  const modules = empresa?.modules ?? { products: false, services: false }

  // Refrescar empresa al montar y, si sigue pendiente, hacer polling cada 30s
  // para reflejar aprobaci\u00f3n del admin sin requerir re-login.
  useEffect(() => {
    refreshEmpresa()
    if (isApproved) return
    const interval = setInterval(() => { refreshEmpresa() }, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproved])

  // Filtrar items: ocultar los que requieren un módulo no activo
  const visibleNavItems = navItems.filter((item) => {
    if (item.requiresModule && !modules[item.requiresModule]) return false
    return true
  })

  useBackButtonGuard(useCallback(() => setShowExitModal(true), []))

  const handleStay = () => {
    setShowExitModal(false)
  }

  const handleLeave = () => {
    setShowExitModal(false)
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <button onClick={() => setShowExitModal(true)} className="text-xl font-bold text-mercarof-navy text-left">
            MERCAROF
          </button>
          <p className="text-xs text-gray-500 mt-1">Panel de Proveedor</p>
        </div>

        {!isApproved && (
          <div className="mx-4 mt-4 mb-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-bold text-amber-800">Cuenta pendiente de aprobación</p>
            <p className="text-[11px] text-amber-700 mt-0.5">Algunas secciones estarán disponibles cuando un administrador apruebe tu empresa.</p>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const needsApproval = item.requiresApproval !== false
            const locked = needsApproval && !isApproved

            if (locked) {
              return (
                <div
                  key={item.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 opacity-40 cursor-not-allowed select-none"
                  title="Disponible cuando tu empresa sea aprobada"
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  <Lock className="w-3.5 h-3.5 ml-auto" />
                </div>
              )
            }

            // Accordion item with children
            if (item.children) {
              const isExpanded = expandedMenu === item.to || location.pathname.startsWith(item.to)
              const anyChildActive = item.children.some(c => location.pathname === c.to)

              return (
                <div key={item.to}>
                  <button
                    onClick={() => setExpandedMenu(isExpanded && !anyChildActive ? null : item.to)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                      anyChildActive
                        ? 'bg-mercarof-cyan/10 text-mercarof-navy'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-mercarof-navy'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
                      {item.children.map(child => {
                        const ChildIcon = child.icon
                        const childActive = location.pathname === child.to
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              childActive
                                ? 'text-mercarof-navy bg-mercarof-cyan/10 border-l-2 border-mercarof-cyan -ml-[2px] pl-[14px]'
                                : 'text-gray-500 hover:text-mercarof-navy hover:bg-gray-50'
                            }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Regular item
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-mercarof-cyan/10 text-mercarof-navy'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-mercarof-navy'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-mercarof-navy text-white flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-mercarof-navy">MERCAROF</span>
        <span className="text-sm text-gray-500">Proveedor</span>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-lg font-semibold text-gray-900">
            {visibleNavItems.flatMap(i => i.children ? [i, ...i.children] : [i]).find(i => i.to === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowExitModal(true)} className="text-sm text-mercarof-cyan hover:underline">
              Ver marketplace →
            </button>
            <button className="relative p-2 text-gray-600 hover:text-mercarof-navy transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>

      <BackButtonModal isOpen={showExitModal} onStay={handleStay} onLeave={handleLeave} />
    </div>
  )
}
