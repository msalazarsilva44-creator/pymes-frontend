import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import Navbar from '../components/Navbar'
import {
  ShoppingCart, Heart, Star, User, Mail, Phone, MapPin, Package,
  CheckCircle2, Camera, Lock, Clock, ChevronRight, Eye, EyeOff, Loader2, AlertCircle
} from 'lucide-react'

interface Ciudad { id: number; nombre: string }
interface Municipio { id: number; nombre: string; ciudad_id: number }

type TabId = 'datos' | 'pedidos' | 'favoritos' | 'contrasena'

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'datos', label: 'Datos personales', icon: User },
  { id: 'pedidos', label: 'Mis Pedidos', icon: Package },
  { id: 'favoritos', label: 'Favoritos', icon: Heart },
  { id: 'contrasena', label: 'Contraseña', icon: Lock },
]

// ===== Interfaces ordenes =====
interface Orden {
  id: number
  numero_orden: string
  empresa_id: number
  empresa?: { id: number; nombre_comercial: string; logo?: string }
  total: number | string
  estado: string
  metodo_pago: string
  tipo_entrega: string
  created_at: string
  items: Array<{ id: number; nombre_servicio: string; cantidad: number; precio: number | string }>
}

const estadoColor: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  pagado: 'bg-blue-100 text-blue-700',
  confirmado: 'bg-cyan-100 text-cyan-700',
  completado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
  reembolsado: 'bg-gray-100 text-gray-700',
}
const estadoLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  confirmado: 'Confirmado',
  completado: 'Completado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
}

export default function ClientePerfil() {
  // ===== Tab state (read from ?tab= query param) =====
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as TabId | null
  const validTabs: TabId[] = ['datos', 'pedidos', 'favoritos', 'contrasena']
  const [activeTab, setActiveTabState] = useState<TabId>(
    tabParam && validTabs.includes(tabParam) ? tabParam : 'datos'
  )

  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab)
    setSearchParams({ tab }, { replace: true })
  }

  // Sync when URL changes externally (e.g. navbar links)
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTabState(tabParam)
    }
  }, [tabParam])

  // ===== Profile state =====
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [saveOk, setSaveOk] = useState(false)

  // ===== Form state =====
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad_id: '' as string | number,
    municipio_id: '' as string | number,
    referencia_direccion: ''
  })
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])

  // ===== Avatar state =====
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // ===== Password state =====
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  // ===== Orders state =====
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [ordenesLoading, setOrdenesLoading] = useState(false)
  const [ordenesLoaded, setOrdenesLoaded] = useState(false)

  // ===== Init =====
  useEffect(() => {
    cargarPerfil()
    cargarCiudades()
  }, [])

  useEffect(() => {
    if (formData.ciudad_id) cargarMunicipios(Number(formData.ciudad_id))
    else setMunicipios([])
  }, [formData.ciudad_id])

  // Lazy-load ordenes on tab switch
  useEffect(() => {
    if (activeTab === 'pedidos' && !ordenesLoaded) {
      cargarOrdenes()
    }
  }, [activeTab, ordenesLoaded])

  // ===== Loaders =====
  const cargarCiudades = async () => {
    try {
      const res = await api.get('/ciudades')
      setCiudades(res.data.data || res.data || [])
    } catch {}
  }

  const cargarMunicipios = async (ciudadId: number) => {
    try {
      const res = await api.get(`/municipios/${ciudadId}`)
      setMunicipios(res.data.data || res.data || [])
    } catch { setMunicipios([]) }
  }

  const cargarPerfil = async () => {
    try {
      const res = await api.get('/cliente/perfil')
      const p = res.data.data
      setPerfil(p)
      setFormData({
        nombre: p.nombre || '',
        email: p.email || '',
        telefono: p.telefono || '',
        direccion: p.direccion || '',
        ciudad_id: p.ciudad_id || '',
        municipio_id: p.municipio_id || '',
        referencia_direccion: p.referencia_direccion || ''
      })
      setAvatarPreview(null)
      setAvatarFile(null)
    } catch (err) {
      console.error('Error al cargar perfil:', err)
      setError('No se pudo cargar el perfil. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const cargarOrdenes = async () => {
    setOrdenesLoading(true)
    try {
      const res = await api.get('/mis-ordenes')
      setOrdenes(res.data.data || [])
      setOrdenesLoaded(true)
    } catch {} finally {
      setOrdenesLoading(false)
    }
  }

  // ===== Handlers =====
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleGuardar = async () => {
    setGuardando(true)
    setSaveOk(false)
    try {
      const fd = new FormData()
      fd.append('nombre', formData.nombre)
      fd.append('email', formData.email)
      if (formData.telefono) fd.append('telefono', formData.telefono)
      if (formData.direccion) fd.append('direccion', formData.direccion)
      if (formData.ciudad_id) fd.append('ciudad_id', String(formData.ciudad_id))
      if (formData.municipio_id) fd.append('municipio_id', String(formData.municipio_id))
      if (formData.referencia_direccion) fd.append('referencia_direccion', formData.referencia_direccion)
      if (avatarFile) fd.append('avatar', avatarFile)

      // Laravel PUT with FormData needs POST + _method
      fd.append('_method', 'PUT')
      await api.post('/cliente/perfil', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setEditando(false)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 2500)
      cargarPerfil()
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err)
      alert(err.response?.data?.message || 'Error al actualizar el perfil')
    } finally {
      setGuardando(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwLoading(true)
    setPwMsg(null)
    try {
      const res = await api.post('/auth/change-password', pwForm)
      setPwMsg({ type: 'ok', text: res.data.message || 'Contraseña actualizada exitosamente' })
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' })
    } catch (err: any) {
      const resp = err.response?.data
      const msg = resp?.message || (resp?.errors ? Object.values(resp.errors).flat().join(' ') : 'Error al cambiar contraseña')
      setPwMsg({ type: 'error', text: msg })
    } finally {
      setPwLoading(false)
    }
  }

  const fmtDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return iso }
  }

  // ===== Render guards =====
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan" />
        </div>
      </div>
    )
  }

  if (error || !perfil) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <p className="text-red-600 font-semibold mb-4">{error || 'No se pudo cargar el perfil'}</p>
            <button
              onClick={cargarPerfil}
              className="px-6 py-2 rounded-xl bg-mercarof-navy text-white font-semibold hover:bg-mercarof-navy/90 transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  const avatarUrl = avatarPreview || (perfil.avatar ? `http://localhost:8000${perfil.avatar}` : null)

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ========== PROFILE HEADER ========== */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-6">
            {/* Avatar con botón de cámara */}
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-mercarof-navy to-mercarof-cyan flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {perfil.nombre?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-mercarof-navy text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-mercarof-cyan transition-colors"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">{perfil.nombre}</h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{perfil.email}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Miembro desde: {perfil.miembro_desde}
              </p>
            </div>

            {/* Si hay avatar nuevo sin guardar */}
            {avatarFile && !editando && (
              <button
                onClick={() => { setEditando(true) }}
                className="px-4 py-2 rounded-xl bg-mercarof-cyan text-white text-sm font-bold hover:bg-mercarof-navy transition-colors"
              >
                Guardar foto
              </button>
            )}
          </div>
        </div>

        {/* ========== STAT CARDS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setActiveTab('pedidos')}
            className="bg-white rounded-2xl p-5 text-center hover:shadow-md transition-shadow cursor-pointer"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: '3px solid #1e6fa8' }}
          >
            <ShoppingCart className="w-7 h-7 mx-auto mb-2 text-mercarof-navy" />
            <p className="text-3xl font-bold" style={{ color: '#0f2942' }}>{perfil.total_pedidos}</p>
            <p className="text-gray-600 font-medium text-sm">Pedidos</p>
          </button>
          <button
            onClick={() => setActiveTab('favoritos')}
            className="bg-white rounded-2xl p-5 text-center hover:shadow-md transition-shadow cursor-pointer"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: '3px solid #1e6fa8' }}
          >
            <Heart className="w-7 h-7 mx-auto mb-2 text-mercarof-navy" />
            <p className="text-3xl font-bold" style={{ color: '#0f2942' }}>0</p>
            <p className="text-gray-600 font-medium text-sm">Favoritos</p>
          </button>
          <button
            onClick={() => setActiveTab('contrasena')}
            className="bg-white rounded-2xl p-5 text-center hover:shadow-md transition-shadow cursor-pointer"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: '3px solid #1e6fa8' }}
          >
            <Star className="w-7 h-7 mx-auto mb-2 text-mercarof-navy" />
            <p className="text-3xl font-bold" style={{ color: '#0f2942' }}>0</p>
            <p className="text-gray-600 font-medium text-sm">Reseñas</p>
          </button>
        </div>

        {/* ========== TABS ========== */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                    isActive
                      ? 'border-mercarof-cyan text-mercarof-navy bg-mercarof-cyan/5'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {/* ===== TAB: DATOS ===== */}
            {activeTab === 'datos' && (
              <div>
                {saveOk && (
                  <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-semibold">Perfil actualizado correctamente</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Información personal y dirección</h3>
                  <button
                    onClick={() => { setEditando(!editando); if (editando) { setAvatarFile(null); setAvatarPreview(null) } }}
                    className="text-mercarof-cyan font-semibold hover:underline text-sm"
                  >
                    {editando ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                {editando ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                      <input
                        type="text"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="0412-1234567"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
                      />
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-bold text-mercarof-navy uppercase tracking-wide mb-3">Dirección de entrega</h4>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                        <input
                          type="text"
                          value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                          placeholder="Av. Principal, edificio, piso, apartamento..."
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad / Estado</label>
                          <select
                            value={formData.ciudad_id}
                            onChange={(e) => setFormData({ ...formData, ciudad_id: e.target.value, municipio_id: '' })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
                          >
                            <option value="">Selecciona tu ciudad</option>
                            {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Municipio</label>
                          <select
                            value={formData.municipio_id}
                            onChange={(e) => setFormData({ ...formData, municipio_id: e.target.value })}
                            disabled={!formData.ciudad_id}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none disabled:opacity-60"
                          >
                            <option value="">Selecciona tu municipio</option>
                            {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Punto de referencia</label>
                        <input
                          type="text"
                          value={formData.referencia_direccion}
                          onChange={(e) => setFormData({ ...formData, referencia_direccion: e.target.value })}
                          placeholder="Cerca de..., casa azul, portón negro..."
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
                        />
                      </div>
                    </div>

                    {avatarFile && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                        <Camera className="w-5 h-5 shrink-0" />
                        <span>Nueva foto de perfil seleccionada. Se guardará al confirmar.</span>
                      </div>
                    )}

                    <button
                      onClick={handleGuardar}
                      disabled={guardando}
                      className="w-full py-3 rounded-xl bg-mercarof-navy text-white font-semibold hover:bg-mercarof-navy/90 transition-colors disabled:opacity-60"
                    >
                      {guardando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{perfil.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{perfil.email}</span>
                    </div>
                    {perfil.telefono && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{perfil.telefono}</span>
                      </div>
                    )}
                    {(perfil.direccion || perfil.ciudad) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div className="text-gray-700">
                          {perfil.direccion && <div>{perfil.direccion}</div>}
                          {(perfil.ciudad || perfil.municipio) && (
                            <div className="text-sm text-gray-500">
                              {[perfil.municipio, perfil.ciudad].filter(Boolean).join(', ')}
                            </div>
                          )}
                          {perfil.referencia_direccion && (
                            <div className="text-xs text-gray-400 italic mt-1">&ldquo;{perfil.referencia_direccion}&rdquo;</div>
                          )}
                        </div>
                      </div>
                    )}
                    {!perfil.direccion && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                        Aún no has registrado una dirección de entrega. Agrégala para agilizar tus compras.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===== TAB: PEDIDOS ===== */}
            {activeTab === 'pedidos' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900">Historial de pedidos</h3>
                  <Link to="/mis-ordenes" className="text-mercarof-cyan font-semibold hover:underline text-sm flex items-center gap-1">
                    Ver página completa <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {ordenesLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-7 h-7 animate-spin text-mercarof-cyan" />
                  </div>
                ) : ordenes.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="w-14 h-14 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Aún no has realizado pedidos</p>
                    <Link
                      to="/marketplace"
                      className="inline-block mt-4 px-6 py-2 rounded-xl bg-mercarof-navy text-white font-semibold hover:bg-mercarof-cyan transition-colors text-sm"
                    >
                      Explorar marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ordenes.map(orden => (
                      <Link
                        key={orden.id}
                        to={`/mis-ordenes/${orden.id}`}
                        className="block bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all border border-transparent hover:border-mercarof-cyan/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {orden.empresa?.logo ? (
                              <img src={`http://localhost:8000/storage/${orden.empresa.logo}`} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-mercarof-navy to-mercarof-cyan text-white flex items-center justify-center font-bold shrink-0">
                                {orden.empresa?.nombre_comercial?.charAt(0) || 'E'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-mercarof-navy text-sm">{orden.numero_orden}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${estadoColor[orden.estado] || 'bg-gray-100 text-gray-700'}`}>
                                  {estadoLabel[orden.estado] || orden.estado}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5">{orden.empresa?.nombre_comercial}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Clock className="w-3 h-3" /> {fmtDate(orden.created_at)}
                                <span>• {orden.items.length} item{orden.items.length !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-mercarof-navy">${Number(orden.total).toFixed(2)}</p>
                            <ChevronRight className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== TAB: FAVORITOS ===== */}
            {activeTab === 'favoritos' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center border-2 border-pink-100">
                  <Heart className="w-10 h-10 text-pink-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Próximamente</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm">
                  Pronto podrás guardar tus empresas y productos favoritos para acceder a ellos rápidamente.
                </p>
              </div>
            )}

            {/* ===== TAB: CONTRASEÑA ===== */}
            {activeTab === 'contrasena' && (
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Cambiar contraseña</h3>

                {pwMsg && (
                  <div className={`mb-4 p-3 rounded-xl border flex items-center gap-2 text-sm font-semibold ${
                    pwMsg.type === 'ok'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {pwMsg.type === 'ok' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    {pwMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña actual</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={pwForm.current_password}
                        onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={pwForm.new_password}
                        onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                        required
                        minLength={8}
                        className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      value={pwForm.new_password_confirmation}
                      onChange={(e) => setPwForm({ ...pwForm, new_password_confirmation: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pwLoading || !pwForm.current_password || !pwForm.new_password || !pwForm.new_password_confirmation}
                    className="w-full py-3 rounded-xl bg-mercarof-navy text-white font-semibold hover:bg-mercarof-navy/90 transition-colors disabled:opacity-60"
                  >
                    {pwLoading ? 'Actualizando...' : 'Cambiar contraseña'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
