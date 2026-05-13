import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { Upload, Check } from 'lucide-react'

const METODOS_PAGO = [
  { tipo: 'banco', nombre: '🏦 Banco' },
  { tipo: 'binance', nombre: '₿ Binance' },
  { tipo: 'paypal', nombre: '💵 PayPal' },
  { tipo: 'zelle', nombre: '💸 Zelle' },
]

export default function SolicitarPlan() {
  const navigate = useNavigate()
  const [planes, setPlanes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [planId, setPlanId] = useState('')
  const [tipoPeriodo, setTipoPeriodo] = useState('')
  const [metodoPago, setMetodoPago] = useState('banco')
  const [formData, setFormData] = useState({
    nombre_empresa_pagadora: '',
    rif_pagador: '',
    referencia_bancaria: '',
    fecha_pago: '',
  })
  const [captureFile, setCaptureFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [precioTotal, setPrecioTotal] = useState<number>(0)

  useEffect(() => {
    cargarPlanes()
  }, [])

  const cargarPlanes = async () => {
    try {
      const res = await api.get('/planes')
      const planesPago = (res.data.data || []).filter((p: any) => p.slug !== 'gratis')
      setPlanes(planesPago)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (planId && tipoPeriodo) {
      const plan = planes.find(p => p.id === parseInt(planId))
      if (plan) {
        const precio = tipoPeriodo === 'mensual' ? plan.precio_mensual : plan.precio_anual
        setPrecioTotal(precio)
      }
    } else {
      setPrecioTotal(0)
    }
  }, [planId, tipoPeriodo, planes])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCaptureFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId || !tipoPeriodo || !captureFile) {
      setMessage({ text: 'Completa todos los campos requeridos', type: 'error' })
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('plan_id', planId)
      fd.append('tipo_periodo', tipoPeriodo)
      fd.append('metodo_pago', metodoPago)
      fd.append('nombre_empresa_pagadora', formData.nombre_empresa_pagadora)
      fd.append('rif_pagador', formData.rif_pagador)
      fd.append('referencia_bancaria', formData.referencia_bancaria)
      fd.append('fecha_pago', formData.fecha_pago)
      fd.append('capture_pago', captureFile)
      
      await api.post('/suscripciones/solicitar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage({ text: 'Solicitud enviada exitosamente', type: 'success' })
      setTimeout(() => navigate('/dashboard/empresa'), 2000)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Error al enviar la solicitud'
      setMessage({ text: errorMsg, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const getReferenciaLabel = () => {
    switch(metodoPago) {
      case 'banco': return 'Referencia Bancaria *'
      case 'binance': return 'Transaction ID (Binance) *'
      case 'paypal': return 'Transaction ID (PayPal) *'
      case 'zelle': return 'Confirmation Code (Zelle) *'
      default: return 'Referencia *'
    }
  }

  const getReferenciaPlaceholder = () => {
    switch(metodoPago) {
      case 'banco': return 'Últimos 4-10 dígitos'
      case 'binance': return 'ID de transacción de Binance'
      case 'paypal': return 'ID de transacción de PayPal'
      case 'zelle': return 'Código de confirmación de Zelle'
      default: return ''
    }
  }

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"/></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Solicitar Plan de Suscripción</h1>
        <p className="text-gray-600">Mejora tu visibilidad con un plan Básico o Premium</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📋 Seleccionar Plan</h2>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Plan *</label>
            <select
              value={planId}
              onChange={e => setPlanId(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">-- Selecciona un plan --</option>
              {planes.map((plan: any) => (
                <option key={plan.id} value={plan.id}>{plan.nombre}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Periodo de Pago *</label>
            <select
              value={tipoPeriodo}
              onChange={e => setTipoPeriodo(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">-- Selecciona el periodo --</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual (¡Ahorra dinero!)</option>
            </select>
          </div>
          {precioTotal > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total a Pagar:</p>
                <p className="text-3xl font-bold text-green-600">${precioTotal.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">💳 Selecciona tu Método de Pago</h2>
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
            {METODOS_PAGO.map(metodo => (
              <button
                key={metodo.tipo}
                type="button"
                onClick={() => setMetodoPago(metodo.tipo)}
                className={`px-6 py-3 font-semibold rounded-t-lg ${metodoPago === metodo.tipo ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {metodo.nombre}
              </button>
            ))}
          </div>

          {metodoPago === 'banco' && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-blue-900 mb-4">🏦 Transferencia Bancaria</h3>
              <div className="space-y-2 text-blue-800">
                <p><strong>Banco:</strong> Banco Provincial</p>
                <p><strong>Tipo:</strong> Cuenta Corriente</p>
                <p><strong>Número de Cuenta:</strong> 0108-1234-56789-0001234</p>
                <p><strong>RIF:</strong> J-12345678-9</p>
                <p><strong>Titular:</strong> ServiLocal C.A.</p>
              </div>
            </div>
          )}

          {metodoPago === 'binance' && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">₿ Binance Pay</h3>
              <div className="space-y-2 text-yellow-800">
                <p><strong>Binance ID:</strong> 123456789</p>
                <p><strong>Email Binance:</strong> pagos@servilocal.com</p>
                <p><strong>Criptomonedas Aceptadas:</strong> USDT, BTC, BNB</p>
              </div>
            </div>
          )}

          {metodoPago === 'paypal' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-l-4 border-indigo-500 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-indigo-900 mb-4">💵 PayPal</h3>
              <div className="space-y-2 text-indigo-800">
                <p><strong>Email PayPal:</strong> pagos@servilocal.com</p>
                <p><strong>Tipo de Cuenta:</strong> Cuenta de Negocios</p>
                <p><strong>Nombre:</strong> ServiLocal</p>
              </div>
            </div>
          )}

          {metodoPago === 'zelle' && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-purple-900 mb-4">💸 Zelle</h3>
              <div className="space-y-2 text-purple-800">
                <p><strong>Email Zelle:</strong> pagos@servilocal.com</p>
                <p><strong>Nombre Registrado:</strong> ServiLocal LLC</p>
                <p><strong>País:</strong> Estados Unidos</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">💰 Información de Pago</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Pagador *</label>
              <input
                type="text"
                value={formData.nombre_empresa_pagadora}
                onChange={e => setFormData({ ...formData, nombre_empresa_pagadora: e.target.value })}
                required
                placeholder="Empresa o Persona que realizó el pago"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">RIF del Pagador *</label>
              <input
                type="text"
                value={formData.rif_pagador}
                onChange={e => setFormData({ ...formData, rif_pagador: e.target.value })}
                required
                placeholder="Ej: J-12345678-9"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{getReferenciaLabel()}</label>
              <input
                type="text"
                value={formData.referencia_bancaria}
                onChange={e => setFormData({ ...formData, referencia_bancaria: e.target.value })}
                required
                placeholder={getReferenciaPlaceholder()}
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Pago *</label>
              <input
                type="date"
                value={formData.fecha_pago}
                onChange={e => setFormData({ ...formData, fecha_pago: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Capture de Pago *</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (MÁX. 5MB)</p>
                </div>
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" required />
              </label>
            </div>
            {preview && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Vista previa:</p>
                <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg border-2 border-gray-300" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {submitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/empresa')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}
