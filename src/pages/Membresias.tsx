import { useEffect, useState } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import MembresiaFormModal from '../components/membresias/MembresiaFormModal'
import { BadgeCheck, Plus, Pencil, Trash2, Star, ToggleLeft, ToggleRight, Users } from 'lucide-react'

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
  empresas_count?: number
}

const BADGE_COLORS: Record<ColorBadge, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  violet: 'bg-violet-100 text-violet-700 border-violet-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
}

const CARD_ACCENTS: Record<ColorBadge, string> = {
  blue: 'from-blue-500 to-blue-600',
  violet: 'from-violet-500 to-violet-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  rose: 'from-rose-500 to-rose-600',
}

export default function Membresias() {
  const [membresias, setMembresias] = useState<Membresia[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Membresia | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchMembresias = async () => {
    try {
      const res = await api.get('/admin/membresias')
      setMembresias(res.data.data || [])
    } catch {
      showToast('Error al cargar membresías', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembresias() }, [])

  const handleToggle = async (id: number) => {
    try {
      const res = await api.patch(`/admin/membresias/${id}/toggle`)
      showToast(res.data.message)
      fetchMembresias()
    } catch {
      showToast('Error al cambiar estado', 'error')
    }
  }

  const handleDelete = async (m: Membresia) => {
    if (m.empresas_count && m.empresas_count > 0) {
      showToast(`No puedes eliminar esta membresía porque tiene ${m.empresas_count} proveedores activos. Desactívala en su lugar.`, 'error')
      return
    }
    if (!window.confirm(`¿Eliminar la membresía "${m.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      const res = await api.delete(`/admin/membresias/${m.id}`)
      showToast(res.data.message)
      fetchMembresias()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error')
    }
  }

  const handleSaved = () => {
    showToast(editing ? 'Membresía actualizada' : 'Membresía creada')
    setModalOpen(false)
    setEditing(null)
    fetchMembresias()
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (m: Membresia) => { setEditing(m); setModalOpen(true) }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-right ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Membresías</h2>
              <p className="text-sm text-gray-500">Planes de suscripción disponibles para proveedores</p>
            </div>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva membresía
        </button>
      </div>

      {/* Empty state */}
      {membresias.length === 0 ? (
        <div className="text-center py-20">
          <BadgeCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500 mb-2">Aún no has creado ninguna membresía</p>
          <p className="text-sm text-gray-400 mb-6">Crea tu primer plan de suscripción para proveedores</p>
          <button
            onClick={openCreate}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all text-sm"
          >
            Crear primera membresía
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {membresias.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md ${
                !m.activo ? 'opacity-60' : ''
              }`}
            >
              {/* Accent bar */}
              <div className={`h-1.5 bg-gradient-to-r ${CARD_ACCENTS[m.color_badge] || CARD_ACCENTS.blue}`} />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{m.nombre}</h3>
                    {m.descripcion && <p className="text-sm text-gray-500 mt-0.5">{m.descripcion}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      m.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {m.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                {/* Destacado badge */}
                {m.destacado && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-600">Destacado — Más popular</span>
                  </div>
                )}

                {/* Precios */}
                <div className="flex items-baseline gap-4 mb-5">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${m.precio_mensual}</span>
                    <span className="text-sm text-gray-500 ml-1">USD/mes</span>
                  </div>
                  <div className="text-sm text-gray-400">|</div>
                  <div>
                    <span className="text-lg font-bold text-gray-700">${m.precio_anual}</span>
                    <span className="text-sm text-gray-500 ml-1">USD/año</span>
                  </div>
                </div>

                {/* Características */}
                {m.caracteristicas && m.caracteristicas.length > 0 && (
                  <ul className="space-y-2 mb-5">
                    {m.caracteristicas.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {c}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Proveedores count */}
                {m.empresas_count !== undefined && m.empresas_count > 0 && (
                  <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-gray-50 rounded-lg">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      {m.empresas_count} {m.empresas_count === 1 ? 'proveedor con este plan' : 'proveedores con este plan'}
                    </span>
                  </div>
                )}

                {/* Color badge preview */}
                <div className="mb-5">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${BADGE_COLORS[m.color_badge] || BADGE_COLORS.blue}`}>
                    {m.nombre}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(m)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="ml-auto">
                    <button
                      onClick={() => handleToggle(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        m.activo
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {m.activo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      {m.activo ? 'Activa' : 'Inactiva'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <MembresiaFormModal
        open={modalOpen}
        membresia={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSaved={handleSaved}
      />
    </AdminLayout>
  )
}
