import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { X, Plus, Trash2 } from 'lucide-react'

type ColorBadge = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose'

type Membresia = {
  id: number
  nombre: string
  slug: string
  descripcion: string | null
  precio_mensual: number
  precio_anual: number
  caracteristicas: string[]
  color_badge: ColorBadge
  activo: boolean
  destacado: boolean
  orden: number
}

type Props = {
  open: boolean
  membresia?: Membresia | null
  onClose: () => void
  onSaved: (m: Membresia) => void
}

const COLOR_OPTIONS: { value: ColorBadge; label: string; bg: string; ring: string }[] = [
  { value: 'blue', label: 'Azul', bg: 'bg-blue-500', ring: 'ring-blue-400' },
  { value: 'violet', label: 'Violeta', bg: 'bg-violet-500', ring: 'ring-violet-400' },
  { value: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { value: 'amber', label: 'Ámbar', bg: 'bg-amber-500', ring: 'ring-amber-400' },
  { value: 'rose', label: 'Rosa', bg: 'bg-rose-500', ring: 'ring-rose-400' },
]

export default function MembresiaFormModal({ open, membresia, onClose, onSaved }: Props) {
  const isEditing = !!membresia

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precioMensual, setPrecioMensual] = useState('')
  const [precioAnual, setPrecioAnual] = useState('')
  const [caracteristicas, setCaracteristicas] = useState<string[]>([])
  const [newCaract, setNewCaract] = useState('')
  const [colorBadge, setColorBadge] = useState<ColorBadge>('blue')
  const [destacado, setDestacado] = useState(false)
  const [activo, setActivo] = useState(true)
  const [orden, setOrden] = useState('0')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (open) {
      if (membresia) {
        setNombre(membresia.nombre)
        setDescripcion(membresia.descripcion || '')
        setPrecioMensual(String(membresia.precio_mensual))
        setPrecioAnual(String(membresia.precio_anual))
        setCaracteristicas(membresia.caracteristicas || [])
        setColorBadge(membresia.color_badge || 'blue')
        setDestacado(membresia.destacado)
        setActivo(membresia.activo)
        setOrden(String(membresia.orden))
      } else {
        setNombre('')
        setDescripcion('')
        setPrecioMensual('')
        setPrecioAnual('')
        setCaracteristicas([])
        setColorBadge('blue')
        setDestacado(false)
        setActivo(true)
        setOrden('0')
      }
      setNewCaract('')
      setErrors({})
    }
  }, [open, membresia])

  const addCaracteristica = () => {
    const val = newCaract.trim()
    if (val && !caracteristicas.includes(val)) {
      setCaracteristicas([...caracteristicas, val])
      setNewCaract('')
    }
  }

  const removeCaracteristica = (idx: number) => {
    setCaracteristicas(caracteristicas.filter((_, i) => i !== idx))
  }

  // Cálculo de ahorro anual en vivo
  const mensual = parseFloat(precioMensual) || 0
  const anual = parseFloat(precioAnual) || 0
  const costoAnualSiMensual = mensual * 12
  const ahorro = costoAnualSiMensual > 0 ? costoAnualSiMensual - anual : 0
  const pctAhorro = costoAnualSiMensual > 0 ? ((ahorro / costoAnualSiMensual) * 100).toFixed(0) : '0'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const payload = {
      nombre,
      descripcion: descripcion || null,
      precio_mensual: parseFloat(precioMensual) || 0,
      precio_anual: parseFloat(precioAnual) || 0,
      caracteristicas,
      color_badge: colorBadge,
      destacado,
      activo,
      orden: parseInt(orden) || 0,
    }

    try {
      let res
      if (isEditing) {
        res = await api.put(`/admin/membresias/${membresia!.id}`, payload)
      } else {
        res = await api.post('/admin/membresias', payload)
      }
      onSaved(res.data.data)
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ general: [err.response?.data?.message || 'Error al guardar'] })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? `Editar: ${membresia?.nombre}` : 'Nueva membresía'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {errors.general && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{errors.general[0]}</div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={60}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm ${errors.nombre ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Ej: Pro, Premium, Básico..."
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre[0]}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={200}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm resize-none"
              placeholder="Breve descripción del plan..."
            />
            <p className="text-xs text-gray-400 mt-1">{descripcion.length}/200</p>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio mensual USD *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precioMensual}
                onChange={(e) => setPrecioMensual(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm ${errors.precio_mensual ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="0.00"
              />
              {errors.precio_mensual && <p className="text-xs text-red-500 mt-1">{errors.precio_mensual[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio anual USD *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precioAnual}
                onChange={(e) => setPrecioAnual(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm ${errors.precio_anual ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="0.00"
              />
              {errors.precio_anual && <p className="text-xs text-red-500 mt-1">{errors.precio_anual[0]}</p>}
            </div>
          </div>

          {/* Ahorro */}
          {mensual > 0 && anual > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-sm text-emerald-700">
              Ahorro anual: <strong>${ahorro.toFixed(2)}</strong> vs pago mensual (<strong>{pctAhorro}%</strong>)
            </div>
          )}

          {/* Características */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Características *</label>
            <div className="flex gap-2 mb-2">
              <input
                value={newCaract}
                onChange={(e) => setNewCaract(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCaracteristica() } }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
                placeholder="Ej: Publicaciones ilimitadas"
                maxLength={100}
              />
              <button
                type="button"
                onClick={addCaracteristica}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {caracteristicas.length === 0 && errors.caracteristicas && (
              <p className="text-xs text-red-500 mb-2">{errors.caracteristicas[0]}</p>
            )}
            <div className="space-y-1.5">
              {caracteristicas.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="flex-1 text-sm text-gray-700">{c}</span>
                  <button
                    type="button"
                    onClick={() => removeCaracteristica(i)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Color badge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color del badge</label>
            <div className="flex gap-3">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColorBadge(opt.value)}
                  className={`w-9 h-9 rounded-full ${opt.bg} transition-all ${
                    colorBadge === opt.value ? `ring-2 ring-offset-2 ${opt.ring} scale-110` : 'opacity-60 hover:opacity-100'
                  }`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setDestacado(!destacado)}
                className={`w-11 h-6 rounded-full relative p-0.5 transition-colors duration-200 cursor-pointer ${destacado ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${destacado ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Destacado como "Más popular"</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setActivo(!activo)}
                className={`w-11 h-6 rounded-full relative p-0.5 transition-colors duration-200 cursor-pointer ${activo ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${activo ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Activo</span>
            </label>
          </div>

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden de aparición</label>
            <input
              type="number"
              min="0"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Controla el orden en el que aparece en la pantalla de suscripción</p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition-all text-sm disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
