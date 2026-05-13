import { useEffect, useState } from 'react'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { Check, Pencil, Trash2, Plus, Save, X } from 'lucide-react'

interface MetodoPago {
  tipo: string
  activo: boolean
  paypal_email?: string
  binance_email?: string
  binance_id?: string
  banco_nombre?: string
  banco_cuenta?: string
  banco_titular?: string
  banco_cedula?: string
  banco_tipo_cuenta?: string
  pago_movil_banco?: string
  pago_movil_cedula?: string
  pago_movil_telefono?: string
}

const METODOS = [
  { tipo: 'paypal', nombre: 'PayPal', descripcion: 'Recibe pagos con tarjeta', icono: '💳', color: 'blue' },
  { tipo: 'binance', nombre: 'Binance (USDT)', descripcion: 'Criptomonedas', icono: '🪙', color: 'yellow' },
  { tipo: 'transferencia', nombre: 'Transferencia Bancaria', descripcion: 'Depósito directo', icono: '🏦', color: 'green' },
  { tipo: 'pago_movil', nombre: 'Pago Móvil', descripcion: 'Transferencia instantánea', icono: '📱', color: 'purple' },
]

const emptyMetodo = (tipo: string): MetodoPago => ({ tipo, activo: false })

export default function MetodosPago() {
  const [metodos, setMetodos] = useState<Record<string, MetodoPago>>(
    Object.fromEntries(METODOS.map(m => [m.tipo, emptyMetodo(m.tipo)]))
  )
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [drafts, setDrafts] = useState<Record<string, MetodoPago>>({})
  const [savingTipo, setSavingTipo] = useState<string | null>(null)
  const [deletingTipo, setDeletingTipo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => { cargarMetodosPago() }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const showToast = (msg: string, ok: boolean) => setToast({ msg, ok })

  const cargarMetodosPago = async () => {
    try {
      const res = await api.get('/empresa/metodos-pago')
      const data = res.data.data || {}
      const nuevos: Record<string, MetodoPago> = {}
      METODOS.forEach(m => {
        nuevos[m.tipo] = data[m.tipo]?.activo ? data[m.tipo] : emptyMetodo(m.tipo)
      })
      setMetodos(nuevos)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (tipo: string) => {
    setDrafts({ ...drafts, [tipo]: { ...metodos[tipo] } })
    setEditing({ ...editing, [tipo]: true })
  }

  const startAdding = (tipo: string) => {
    setDrafts({ ...drafts, [tipo]: { ...emptyMetodo(tipo), activo: true } })
    setEditing({ ...editing, [tipo]: true })
  }

  const cancelEditing = (tipo: string) => {
    const { [tipo]: _, ...rest } = drafts
    setDrafts(rest)
    setEditing({ ...editing, [tipo]: false })
  }

  const updateDraft = (tipo: string, campo: string, valor: string) => {
    setDrafts({ ...drafts, [tipo]: { ...drafts[tipo], [campo]: valor } })
  }

  const guardarMetodo = async (tipo: string) => {
    setSavingTipo(tipo)
    try {
      const data = { ...drafts[tipo], activo: true }
      await api.post('/empresa/metodos-pago', data)
      setMetodos({ ...metodos, [tipo]: data })
      setEditing({ ...editing, [tipo]: false })
      const { [tipo]: _, ...rest } = drafts
      setDrafts(rest)
      showToast('Método de pago guardado exitosamente', true)
    } catch {
      showToast('Error al guardar método de pago', false)
    } finally {
      setSavingTipo(null)
    }
  }

  const eliminarMetodo = async (tipo: string) => {
    if (!confirm('¿Eliminar este método de pago?')) return
    setDeletingTipo(tipo)
    try {
      await api.delete(`/empresa/metodos-pago/${tipo}`)
      setMetodos({ ...metodos, [tipo]: emptyMetodo(tipo) })
      setEditing({ ...editing, [tipo]: false })
      showToast('Método de pago eliminado', true)
    } catch {
      showToast('Error al eliminar método de pago', false)
    } finally {
      setDeletingTipo(null)
    }
  }

  const isSaved = (tipo: string) => metodos[tipo]?.activo === true
  const isEditing = (tipo: string) => editing[tipo] === true
  const current = (tipo: string) => isEditing(tipo) ? drafts[tipo] : metodos[tipo]

  const inputClass = (disabled: boolean) =>
    `w-full px-4 py-3 border rounded-xl transition-colors ${disabled ? 'bg-gray-50 border-gray-100 text-gray-700' : 'border-gray-200 focus:border-mercarof-cyan focus:ring-2 focus:ring-mercarof-cyan/20'}`

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan"/></div></DashboardLayout>

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all ${toast.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="gradient-bg rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-3xl">💳</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Métodos de Pago</h1>
            <p className="text-white/80">Configura cómo recibir pagos de tus clientes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {METODOS.map(metodo => {
          const saved = isSaved(metodo.tipo)
          const editMode = isEditing(metodo.tipo)
          const data = current(metodo.tipo)
          const disabled = !editMode

          return (
            <div key={metodo.tipo} className={`bg-white rounded-2xl shadow-sm p-6 border-2 transition-colors ${saved ? 'border-mercarof-cyan' : editMode ? 'border-mercarof-cyan/50' : 'border-gray-100'}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-${metodo.color}-50 rounded-xl flex items-center justify-center`}>
                    <span className="text-3xl">{metodo.icono}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{metodo.nombre}</h3>
                    <p className="text-sm text-gray-500">{metodo.descripcion}</p>
                  </div>
                </div>
                {saved && !editMode && (
                  <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full">
                    <Check className="w-3.5 h-3.5" /> Activo
                  </span>
                )}
              </div>

              {/* Not configured yet */}
              {!saved && !editMode && (
                <button
                  onClick={() => startAdding(metodo.tipo)}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-mercarof-cyan hover:text-mercarof-cyan transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Agregar {metodo.nombre}
                </button>
              )}

              {/* Form fields (edit mode or saved read-only) */}
              {(saved || editMode) && (
                <div className="space-y-4 mt-2">
                  {metodo.tipo === 'paypal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email de PayPal</label>
                      <input
                        type="email"
                        value={data?.paypal_email || ''}
                        onChange={e => updateDraft(metodo.tipo, 'paypal_email', e.target.value)}
                        placeholder="tu-email@paypal.com"
                        disabled={disabled}
                        className={inputClass(disabled)}
                      />
                    </div>
                  )}

                  {metodo.tipo === 'binance' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email de Binance</label>
                        <input
                          type="email"
                          value={data?.binance_email || ''}
                          onChange={e => updateDraft(metodo.tipo, 'binance_email', e.target.value)}
                          placeholder="tu-email@binance.com"
                          disabled={disabled}
                          className={inputClass(disabled)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID de Binance Pay</label>
                        <input
                          type="text"
                          value={data?.binance_id || ''}
                          onChange={e => updateDraft(metodo.tipo, 'binance_id', e.target.value)}
                          placeholder="ID de Binance Pay"
                          disabled={disabled}
                          className={inputClass(disabled)}
                        />
                      </div>
                    </>
                  )}

                  {metodo.tipo === 'transferencia' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Banco</label>
                          <input
                            type="text"
                            value={data?.banco_nombre || ''}
                            onChange={e => updateDraft(metodo.tipo, 'banco_nombre', e.target.value)}
                            placeholder="Nombre del Banco"
                            disabled={disabled}
                            className={inputClass(disabled)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cuenta</label>
                          <select
                            value={data?.banco_tipo_cuenta || ''}
                            onChange={e => updateDraft(metodo.tipo, 'banco_tipo_cuenta', e.target.value)}
                            disabled={disabled}
                            className={inputClass(disabled)}
                          >
                            <option value="">Seleccionar</option>
                            <option value="corriente">Corriente</option>
                            <option value="ahorro">Ahorro</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número de Cuenta</label>
                        <input
                          type="text"
                          value={data?.banco_cuenta || ''}
                          onChange={e => updateDraft(metodo.tipo, 'banco_cuenta', e.target.value)}
                          placeholder="0000-0000-0000-0000"
                          disabled={disabled}
                          className={inputClass(disabled)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Titular</label>
                        <input
                          type="text"
                          value={data?.banco_titular || ''}
                          onChange={e => updateDraft(metodo.tipo, 'banco_titular', e.target.value)}
                          placeholder="Nombre completo"
                          disabled={disabled}
                          className={inputClass(disabled)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cédula del Titular</label>
                        <input
                          type="text"
                          value={data?.banco_cedula || ''}
                          onChange={e => updateDraft(metodo.tipo, 'banco_cedula', e.target.value)}
                          placeholder="V-12345678"
                          disabled={disabled}
                          className={inputClass(disabled)}
                        />
                      </div>
                    </>
                  )}

                  {metodo.tipo === 'pago_movil' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Código del Banco</label>
                        <input
                          type="text"
                          value={data?.pago_movil_banco || ''}
                          onChange={e => updateDraft(metodo.tipo, 'pago_movil_banco', e.target.value)}
                          placeholder="0102, 0134, 0175..."
                          disabled={disabled}
                          className={inputClass(disabled)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cédula</label>
                        <input
                          type="text"
                          value={data?.pago_movil_cedula || ''}
                          onChange={e => updateDraft(metodo.tipo, 'pago_movil_cedula', e.target.value)}
                          placeholder="V-12345678"
                          disabled={disabled}
                          className={inputClass(disabled)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input
                          type="text"
                          value={data?.pago_movil_telefono || ''}
                          onChange={e => updateDraft(metodo.tipo, 'pago_movil_telefono', e.target.value)}
                          placeholder="0412-1234567"
                          disabled={disabled}
                          className={inputClass(disabled)}
                        />
                      </div>
                    </>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                    {editMode ? (
                      <>
                        <button
                          onClick={() => guardarMetodo(metodo.tipo)}
                          disabled={savingTipo === metodo.tipo}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                          {savingTipo === metodo.tipo ? (
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                          {savingTipo === metodo.tipo ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => cancelEditing(metodo.tipo)}
                          className="px-6 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <X className="w-5 h-5" /> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(metodo.tipo)}
                          className="flex-1 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Pencil className="w-5 h-5" /> Editar
                        </button>
                        <button
                          onClick={() => eliminarMetodo(metodo.tipo)}
                          disabled={deletingTipo === metodo.tipo}
                          className="px-6 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {deletingTipo === metodo.tipo ? (
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
