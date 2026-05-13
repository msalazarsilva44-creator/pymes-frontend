import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { api } from '../services/api'
import { PackagePlus, Loader2, CheckCircle2, Package } from 'lucide-react'

const COLORS = {
  primary: '#0E9AA7',
  navy: '#0D3B66',
}

interface ProductoOption {
  id: number
  nombre: string
  cantidad: number
}

export default function IngresoMercancia() {
  const [productos, setProductos] = useState<ProductoOption[]>([])
  const [loadingProductos, setLoadingProductos] = useState(true)

  // Form
  const [productoId, setProductoId] = useState<number | ''>('')
  const [cantidad, setCantidad] = useState<number | ''>('')
  const [comentario, setComentario] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // State
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      const perfil = await api.get('/auth/me')
      const userData = perfil.data.data || perfil.data
      if (userData.empresa) {
        const res = await api.get(`/empresas/${userData.empresa.id}/productos`)
        const lista = (res.data.data || res.data || []).map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad ?? 0,
        }))
        setProductos(lista)
      }
    } catch (err) {
      console.error('Error cargando productos:', err)
    } finally {
      setLoadingProductos(false)
    }
  }

  const productoSeleccionado = productos.find(p => p.id === productoId)

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleSelectProducto = (p: ProductoOption) => {
    setProductoId(p.id)
    setBusqueda(p.nombre)
    setShowDropdown(false)
  }

  const handleGuardar = async () => {
    if (!productoId || !cantidad || cantidad < 1 || !comentario.trim()) return

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await api.post('/empresa/productos/ingreso', {
        producto_id: productoId,
        cantidad: Number(cantidad),
        comentario: comentario.trim(),
      })
      setSuccess(`Ingreso registrado correctamente. Stock actualizado: ${res.data.cantidad_nueva} unidades.`)
      // Reset form
      setProductoId('')
      setCantidad('')
      setComentario('')
      setBusqueda('')
      // Refresh product list to update stock numbers
      await cargarProductos()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al registrar el ingreso'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const isValid = productoId && cantidad && Number(cantidad) >= 1 && comentario.trim().length > 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.primary} 100%)` }}>
          <div className="flex items-center gap-3">
            <PackagePlus className="w-7 h-7" />
            <div>
              <h2 className="text-2xl font-bold">Ingreso de Mercancía</h2>
              <p className="text-white/70 text-sm mt-1">Registra nuevas unidades al inventario de tus productos</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {/* Success */}
            {success && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Producto */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Producto</label>
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => { setBusqueda(e.target.value); setShowDropdown(true); setProductoId('') }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={loadingProductos ? 'Cargando productos...' : 'Buscar producto...'}
                  disabled={loadingProductos}
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none transition-all"
                />
                {showDropdown && busqueda.length >= 0 && productosFiltrados.length > 0 && !productoId && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    {productosFiltrados.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProducto(p)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0"
                      >
                        <span className="text-sm font-medium text-gray-800">{p.nombre}</span>
                        <span className="text-xs text-gray-400">Stock: {p.cantidad}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && productosFiltrados.length === 0 && busqueda && !productoId && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
                    <p className="text-sm text-gray-400 text-center">No se encontraron productos</p>
                  </div>
                )}
              </div>
              {productoSeleccionado && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700">
                    Stock actual: {productoSeleccionado.cantidad} unidades
                  </span>
                </div>
              )}
            </div>

            {/* Cantidad */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad a Ingresar</label>
              <input
                type="number"
                min={1}
                value={cantidad}
                onChange={e => setCantidad(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Ej. 50"
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none transition-all"
              />
            </div>

            {/* Comentario */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comentario <span className="text-red-400">*</span>
              </label>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value.slice(0, 300))}
                placeholder="Ejm. Reposición de inventario"
                rows={3}
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{comentario.length}/300</p>
            </div>

            {/* Submit */}
            <button
              onClick={handleGuardar}
              disabled={!isValid || saving}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <PackagePlus className="w-5 h-5" />
              )}
              {saving ? 'Guardando...' : 'Guardar Ingreso'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
