import { Link } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, Heart, Lock, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import BackButtonModal from './BackButtonModal'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    setShowLogout(false)
    window.location.href = '/login'
  }

  return (
    <>
      <nav className="bg-mercarof-navy shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">MERCAROF</span>
          </Link>

          {/* Buscador desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar servicios, empresas..."
                className="w-full px-4 py-2.5 pl-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-mercarof-cyan bg-white/90"
              />
              <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/carrito" className="text-white hover:text-gray-200 relative">
                  <ShoppingCart className="w-6 h-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-white">
                    <User className="w-6 h-6" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl py-2 border border-gray-100">
                      <Link to="/cliente/perfil" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Mi cuenta</span>
                      </Link>
                      <Link to="/cliente/perfil?tab=pedidos" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Mis pedidos</span>
                      </Link>
                      <Link to="/cliente/perfil?tab=favoritos" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Favoritos</span>
                      </Link>
                      <Link to="/cliente/perfil?tab=contrasena" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Contraseña</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => { setShowLogout(true) }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">Cerrar sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-block text-white hover:text-gray-200 font-medium px-4 py-2 rounded-lg transition-all">
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="bg-white text-mercarof-navy hover:bg-gray-100 font-semibold px-6 py-2 rounded-lg transition-all shadow-md">
                  Registrarse
                </Link>
              </>
            )}
            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Buscador mobile */}
        <div className="md:hidden pb-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar servicios..."
              className="w-full px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mercarof-cyan bg-white/90"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </nav>
    <BackButtonModal
      isOpen={showLogout}
      onLeave={handleLogout}
      onStay={() => setShowLogout(false)}
    />
    </>
  )
}
