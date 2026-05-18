import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBackButtonGuard } from '../hooks/useBackButtonGuard'
import BackButtonModal from './BackButtonModal'
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BadgeCheck,
  Users,
  Wrench,
  FileBarChart,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'

type NavItem = {
  to: string
  icon: typeof LayoutDashboard
  label: string
}

const navItems: NavItem[] = [
  { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/admin/proveedores', icon: Building2, label: 'Proveedores' },
  { to: '/dashboard/admin/pagos', icon: CreditCard, label: 'Pagos' },
  { to: '/dashboard/admin/membresias', icon: BadgeCheck, label: 'Membresías' },
  { to: '/dashboard/admin/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/dashboard/admin/servicios', icon: Wrench, label: 'Servicios' },
  { to: '/dashboard/admin/reportes', icon: FileBarChart, label: 'Reportes' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [showExitModal, setShowExitModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useBackButtonGuard(useCallback(() => setShowExitModal(true), []))

  const handleLeave = () => {
    setShowExitModal(false)
    logout()
    window.location.href = '/login'
  }

  const currentLabel = navItems.find(i => location.pathname === i.to)?.label || 'Panel Admin'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-[#1a1a2e] flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/dashboard/admin" className="text-xl font-bold text-white">
            MERCAROF
          </Link>
          <p className="text-xs text-white/40 mt-1">Panel Administrador</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-orange-500/15 text-orange-400'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#1a1a2e] z-50 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-white">MERCAROF</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-1">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-[#1a1a2e] flex flex-col z-50">
            <div className="p-6 border-b border-white/10">
              <span className="text-xl font-bold text-white">MERCAROF</span>
              <p className="text-xs text-white/40 mt-1">Panel Administrador</p>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-orange-500/15 text-orange-400'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => { setMobileMenuOpen(false); setShowExitModal(true) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 mt-12 md:mt-0">
          <h1 className="text-lg font-semibold text-gray-900">{currentLabel}</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>

      <BackButtonModal isOpen={showExitModal} onStay={() => setShowExitModal(false)} onLeave={handleLeave} />
    </div>
  )
}
