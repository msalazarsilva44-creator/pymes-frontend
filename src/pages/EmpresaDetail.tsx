import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { MapPin, Phone, Star, Clock, Package, Wrench, ChevronLeft, Globe, ShoppingCart, Plus, Minus, Check, LogIn, AlertTriangle } from 'lucide-react'

export default function EmpresaDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [showAuthToast, setShowAuthToast] = useState(false)
  const [empresa, setEmpresa] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())
  const [cartError, setCartError] = useState<string | null>(null)
  const [cantidades, setCantidades] = useState<Record<number, number>>({})
  const [conflict, setConflict] = useState<{
    tipo: 'servicio' | 'producto'
    id: number
    cantidad: number
    empresaActual: { id: number; nombre_comercial: string }
  } | null>(null)

  useEffect(() => {
    cargarEmpresa()
  }, [id])

  const cargarEmpresa = async () => {
    try {
      const res = await api.get(`/empresas/${id}`)
      setEmpresa(res.data.data)
    } catch (err) {
      console.error('Error al cargar empresa:', err)
    } finally {
      setLoading(false)
    }
  }

  const requireAuth = () => {
    if (!token) {
      setShowAuthToast(true)
      setTimeout(() => setShowAuthToast(false), 3000)
      return false
    }
    return true
  }

  const getCantidad = (productoId: number) => cantidades[productoId] ?? 1
  const setCantidad = (productoId: number, value: number) => {
    setCantidades(prev => ({ ...prev, [productoId]: Math.max(1, value) }))
  }

  const doAddToCart = async (
    tipo: 'servicio' | 'producto',
    itemId: number,
    cantidad: number,
    opts?: { force?: boolean }
  ) => {
    setCartError(null)
    setAddingToCart(itemId)
    const res = await addToCart(tipo, itemId, cantidad, opts)
    setAddingToCart(null)

    if (res.ok) {
      setAddedItems(prev => new Set(prev).add(itemId))
      setTimeout(() => {
        setAddedItems(prev => {
          const s = new Set(prev)
          s.delete(itemId)
          return s
        })
      }, 2000)
      return
    }

    if (!res.ok && res.conflict) {
      setConflict({ tipo, id: itemId, cantidad, empresaActual: res.empresaActual })
      return
    }

    setCartError(res.message || 'No se pudo agregar al carrito')
    setTimeout(() => setCartError(null), 3000)
  }

  const handleAddToCart = async (tipo: 'servicio' | 'producto', itemId: number) => {
    if (!requireAuth()) return
    const cantidad = tipo === 'producto' ? getCantidad(itemId) : 1
    await doAddToCart(tipo, itemId, cantidad)
  }

  const confirmClearAndAdd = async () => {
    if (!conflict) return
    const { tipo, id: itemId, cantidad } = conflict
    setConflict(null)
    await doAddToCart(tipo, itemId, cantidad, { force: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan" />
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Empresa no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
      {/* Empresa conflict modal */}
      {conflict && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" style={{ animation: 'authFadeIn 200ms ease-out' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full" style={{ animation: 'authScaleIn 250ms ease-out' }}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D6E] mb-2 text-center">Tu carrito tiene otra empresa</h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Ya tienes items de <strong>{conflict.empresaActual.nombre_comercial}</strong>.
              Sólo puedes comprar de una empresa a la vez. ¿Vaciar tu carrito actual y agregar este?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConflict(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearAndAdd}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}
              >
                Vaciar y agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth required overlay */}
      {showAuthToast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm" style={{ animation: 'authFadeIn 200ms ease-out' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center" style={{ animation: 'authScaleIn 250ms ease-out' }}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center border border-amber-100">
              <LogIn className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D6E] mb-2">Inicia sesión para continuar</h3>
            <p className="text-sm text-gray-500 mb-6">Debes estar registrado para comprar productos o contactar empresas.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAuthToast(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #0F3D6E 0%, #1D6FAD 50%, #00B4D8 100%)' }}
              >
                Ir al login
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes authFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes authScaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      {/* Header de navegación */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-gray-600 hover:text-mercarof-navy transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Volver al Marketplace</span>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {cartError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{cartError}</span>
            <button 
              onClick={() => setCartError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Banner con Logo - separado en capas */}
        <div className="relative mb-16">
          {/* Banner */}
          <div className="rounded-2xl overflow-hidden" style={{ 
            background: 'linear-gradient(135deg, #0f2942 0%, #1e6fa8 100%)',
            height: '200px'
          }}>
            {/* Patrón geométrico sutil */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-64 h-64 bg-white rounded-full -top-32 -left-32"></div>
              <div className="absolute w-48 h-48 bg-white rounded-full -bottom-24 -right-24"></div>
            </div>

            {/* Banner image si existe */}
            {empresa.banner && (
              <img
                src={`http://localhost:8000${empresa.banner}`}
                alt="Banner"
                className="w-full h-full object-cover opacity-50"
              />
            )}
          </div>

          {/* Logo circular - fuera del banner */}
          <div className="absolute -bottom-12 left-8">
            {empresa.logo ? (
              <img
                src={`http://localhost:8000${empresa.logo}`}
                alt={empresa.nombre_comercial}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                style={{ zIndex: 10 }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-mercarof-navy to-mercarof-cyan flex items-center justify-center" style={{ zIndex: 10 }}>
                <span className="text-white text-3xl font-bold">{empresa.nombre_comercial?.charAt(0) || 'E'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info principal - offset por el logo */}
        <div className="ml-36 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{empresa.nombre_comercial}</h1>
            {empresa.verificado && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                <Star className="w-4 h-4 fill-current" />
                Verificado
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{typeof empresa.calificacion_promedio === 'number' ? empresa.calificacion_promedio.toFixed(2) : 'N/A'}</span>
              <span className="text-gray-400">({empresa.total_resenas || 0} reseñas)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{empresa.ciudad?.nombre}, {empresa.municipio?.nombre}</span>
            </div>
            {empresa.telefono && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{empresa.telefono}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-900">
              {empresa.categoria?.nombre}
            </span>
            {empresa.plan && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-mercarof-cyan text-white">
                Plan {empresa.plan.nombre}
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              🕐 Abierto ahora
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { if (!requireAuth()) return; /* TODO: contactar lógica */ }}
              className="px-6 py-2.5 rounded-lg font-semibold text-white transition-all hover:transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#0f2942' }}
            >
              Contactar
            </button>
            <button className="px-6 py-2.5 rounded-lg font-semibold transition-all hover:transform hover:-translate-y-0.5" style={{ backgroundColor: 'transparent', border: '2px solid #0f2942', color: '#0f2942' }}>
              Compartir
            </button>
          </div>
        </div>

        {/* Barra de stats rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center" style={{ borderTop: '3px solid #1e6fa8', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
            <p className="text-2xl font-bold" style={{ color: '#0f2942' }}>{empresa.servicios?.length || 0}</p>
            <p className="text-xs font-medium text-gray-500 uppercase mt-1">Servicios</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center" style={{ borderTop: '3px solid #1e6fa8', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
            <p className="text-2xl font-bold" style={{ color: '#0f2942' }}>{empresa.productos?.length || 0}</p>
            <p className="text-xs font-medium text-gray-500 uppercase mt-1">Productos</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center" style={{ borderTop: '3px solid #1e6fa8', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
            <p className="text-2xl font-bold" style={{ color: '#0f2942' }}>{typeof empresa.calificacion_promedio === 'number' ? empresa.calificacion_promedio.toFixed(2) : 'N/A'}</p>
            <p className="text-xs font-medium text-gray-500 uppercase mt-1">Rating</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center" style={{ borderTop: '3px solid #1e6fa8', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
            <p className="text-2xl font-bold" style={{ color: '#0f2942' }}>15+</p>
            <p className="text-xs font-medium text-gray-500 uppercase mt-1">Experiencia</p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
          {/* Columna izquierda - Servicios y Productos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Servicios */}
            {empresa.servicios && empresa.servicios.length > 0 && (
              <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-mercarof-cyan" />
                  Servicios ({empresa.servicios.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {empresa.servicios.map((servicio: any) => (
                    <div key={servicio.id} className="border border-gray-200 rounded-xl p-5 hover:border-mercarof-cyan hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-mercarof-navy" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{servicio.nombre}</h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{servicio.descripcion || 'Sin descripción'}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {servicio.precio ? `$${servicio.precio}` : 'Consultar'}
                        </span>
                        <button 
                          onClick={() => handleAddToCart('servicio', servicio.id)}
                          disabled={addingToCart === servicio.id || addedItems.has(servicio.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            addedItems.has(servicio.id)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-mercarof-navy text-white hover:bg-mercarof-cyan'
                          } disabled:opacity-50`}
                        >
                          {addingToCart === servicio.id ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : addedItems.has(servicio.id) ? (
                            <>
                              <Check className="w-4 h-4" />
                              Agregado
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Agregar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Productos */}
            {empresa.productos && empresa.productos.length > 0 && (
              <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-mercarof-cyan" />
                  Productos ({empresa.productos.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {empresa.productos.map((producto: any) => (
                    <div key={producto.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group">
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {producto.imagenes && producto.imagenes.length > 0 ? (
                          <img
                            src={`http://localhost:8000${producto.imagenes[0].url}`}
                            alt={producto.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        {producto.es_basico && (
                          <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-gray-900 text-xs px-2 py-1 rounded-full">
                            Básico
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{producto.nombre}</h3>
                        {producto.descripcion && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{producto.descripcion}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-lg" style={{ color: '#0f2942' }}>${producto.precio}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Stock: {producto.cantidad}</span>
                        </div>
                        {/* Selector de cantidad */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cantidad</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCantidad(producto.id, getCantidad(producto.id) - 1)}
                              disabled={getCantidad(producto.id) <= 1}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center transition-colors"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={producto.cantidad || 9999}
                              value={getCantidad(producto.id)}
                              onChange={(e) => {
                                const v = parseInt(e.target.value || '1', 10)
                                const max = producto.cantidad || 9999
                                setCantidad(producto.id, Math.min(Math.max(1, isNaN(v) ? 1 : v), max))
                              }}
                              className="w-12 text-center text-sm font-bold border border-gray-200 rounded-md py-0.5 focus:outline-none focus:border-mercarof-cyan"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const max = producto.cantidad || 9999
                                setCantidad(producto.id, Math.min(getCantidad(producto.id) + 1, max))
                              }}
                              disabled={getCantidad(producto.id) >= (producto.cantidad || 9999)}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center transition-colors"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAddToCart('producto', producto.id)}
                          disabled={addingToCart === producto.id || addedItems.has(producto.id)}
                          className={`w-full mt-3 py-2 rounded-lg font-semibold text-white transition-all ${
                            addedItems.has(producto.id)
                              ? 'bg-green-500'
                              : 'bg-mercarof-navy hover:bg-mercarof-cyan'
                          } disabled:opacity-50 ${
                            addedItems.has(producto.id) ? '' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                          }`}
                        >
                          {addingToCart === producto.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              Agregando...
                            </span>
                          ) : addedItems.has(producto.id) ? (
                            <span className="flex items-center justify-center gap-2">
                              <Check className="w-4 h-4" />
                              Agregado
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              Agregar al carrito
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reseñas */}
            {empresa.resenas && empresa.resenas.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-mercarof-cyan" />
                  Reseñas ({empresa.resenas.length})
                </h2>
                <div className="space-y-4">
                  {empresa.resenas.map((resena: any) => (
                    <div key={resena.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-mercarof-navy to-mercarof-cyan text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {resena.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{resena.user?.name || 'Usuario'}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < resena.calificacion ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 mt-1">{resena.comentario}</p>
                          {resena.respuesta && (
                            <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-mercarof-navy mb-1">Respuesta de la empresa:</p>
                              <p className="text-sm text-gray-600">{resena.respuesta}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Horarios */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-mercarof-cyan" />
                Horarios
              </h2>
              {empresa.horarios && empresa.horarios.length > 0 ? (
                <div className="space-y-2">
                  {empresa.horarios.map((horario: any) => (
                    <div key={horario.id} className="flex justify-between items-center text-sm py-2 px-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${horario.dia_semana === 'Lunes' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="font-medium text-gray-700">{horario.dia_semana}</span>
                      </div>
                      <span className="text-gray-600">
                        {horario.hora_apertura} - {horario.hora_cierre}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay horarios disponibles</p>
              )}
            </div>

            {/* Redes sociales */}
            <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Síguenos</h2>
              <div className="flex gap-3">
                {empresa.facebook && (
                  <a href={empresa.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {empresa.instagram && (
                  <a href={empresa.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {empresa.twitter && (
                  <a href={empresa.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {empresa.sitio_web && (
                  <a href={empresa.sitio_web} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
              {!empresa.facebook && !empresa.instagram && !empresa.twitter && !empresa.sitio_web && (
                <button className="w-full mt-3 py-2 text-sm font-medium text-mercarof-cyan border-2 border-mercarof-cyan rounded-lg hover:bg-blue-50 transition-colors">
                  + Agregar red social
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white py-8 px-4 mt-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold">{empresa.nombre_comercial}</h3>
                <p className="text-gray-400 text-sm mt-1">{empresa.descripcion?.substring(0, 100) || 'Servicios locales de calidad'}</p>
              </div>
              <div className="flex gap-3">
                {empresa.facebook && (
                  <a href={empresa.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <span className="font-bold">F</span>
                  </a>
                )}
                {empresa.instagram && (
                  <a href={empresa.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <span className="font-bold">I</span>
                  </a>
                )}
                {empresa.twitter && (
                  <a href={empresa.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <span className="font-bold">X</span>
                  </a>
                )}
                {empresa.sitio_web && (
                  <a href={empresa.sitio_web} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
            <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400 text-sm">
              <p>© 2026 {empresa.nombre_comercial}. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
