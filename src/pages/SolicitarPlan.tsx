import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { PlanSelector } from '../components/Payment/PlanSelector'
import { PaymentMethodTabs } from '../components/Payment/PaymentMethodTabs'
import { BankDetails } from '../components/Payment/BankDetails'
import { OrderSummary } from '../components/Payment/OrderSummary'
import { PaymentForm } from '../components/Payment/PaymentForm'
import { ProofUpload } from '../components/Payment/ProofUpload'
import type { Plan, PaymentFieldKey } from '../components/Payment/types'

const METODOS_PAGO = [
  { tipo: 'banco', nombre: '🏦 Banco' },
  { tipo: 'binance', nombre: '₿ Binance' },
  { tipo: 'paypal', nombre: '💵 PayPal' },
  { tipo: 'zelle', nombre: '💸 Zelle' },
]

export default function SolicitarPlan() {
  const navigate = useNavigate()
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [planId, setPlanId] = useState<number | null>(null)
  const [tipoPeriodo, setTipoPeriodo] = useState<'mensual' | 'anual'>('mensual')
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
  const [touched, setTouched] = useState<Partial<Record<PaymentFieldKey, boolean>>>({})
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        const res = await api.get('/membresias/activas')
        const data: Plan[] = (res.data.data || []).filter((p: Plan) => p.slug !== 'gratis')
        setPlanes(data)
        const destacado = data.find(p => p.destacado) || data[0]
        if (destacado) setPlanId(destacado.id)
      } catch (err) {
        console.error(err)
        setMessage({ text: 'No se pudieron cargar los planes. Intenta de nuevo más tarde.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    cargarPlanes()
  }, [])

  const selectedPlan = planes.find(p => p.id === planId)
  const precioTotal = selectedPlan
    ? Number(tipoPeriodo === 'mensual' ? selectedPlan.precio_mensual : selectedPlan.precio_anual)
    : 0

  const processFile = (file: File) => {
    setCaptureFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const soloNumeros = (valor: string) => valor.replace(/\D/g, '')

  const validarFormulario = () => {
    const rifClean = soloNumeros(formData.rif_pagador)
    if (rifClean.length < 7 || rifClean.length > 9) {
      setMessage({ text: 'El RIF o cédula del pagador debe tener entre 7 y 9 dígitos numéricos.', type: 'error' })
      return false
    }
    const refClean = soloNumeros(formData.referencia_bancaria)
    if (refClean.length !== 6) {
      setMessage({ text: 'La referencia bancaria debe tener exactamente 6 dígitos (últimos 6 de la referencia).', type: 'error' })
      return false
    }
    if (!formData.nombre_empresa_pagadora.trim()) {
      setMessage({ text: 'El nombre del pagador es requerido.', type: 'error' })
      return false
    }
    if (!formData.fecha_pago) {
      setMessage({ text: 'La fecha de pago es requerida.', type: 'error' })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId || !captureFile) {
      setMessage({ text: 'Selecciona un plan y sube el capture de pago.', type: 'error' })
      return
    }
    if (!validarFormulario()) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('plan_id', String(planId))
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
      case 'banco': return 'Últimos 6 dígitos de la referencia'
      case 'binance': return 'ID de transacción de Binance'
      case 'paypal': return 'ID de transacción de PayPal'
      case 'zelle': return 'Código de confirmación de Zelle'
      default: return ''
    }
  }

  const FIELDS: PaymentFieldKey[] = [
    'nombre_empresa_pagadora',
    'rif_pagador',
    'referencia_bancaria',
    'fecha_pago',
  ]

  // Reutiliza exactamente las reglas/mensajes de validarFormulario
  const fieldError = (field: PaymentFieldKey): string => {
    switch (field) {
      case 'rif_pagador': {
        const c = soloNumeros(formData.rif_pagador)
        return c.length < 7 || c.length > 9
          ? 'El RIF o cédula del pagador debe tener entre 7 y 9 dígitos numéricos.'
          : ''
      }
      case 'referencia_bancaria': {
        const c = soloNumeros(formData.referencia_bancaria)
        return c.length !== 6
          ? 'La referencia bancaria debe tener exactamente 6 dígitos (últimos 6 de la referencia).'
          : ''
      }
      case 'nombre_empresa_pagadora':
        return formData.nombre_empresa_pagadora.trim() ? '' : 'El nombre del pagador es requerido.'
      case 'fecha_pago':
        return formData.fecha_pago ? '' : 'La fecha de pago es requerida.'
      default:
        return ''
    }
  }

  const errors: Partial<Record<PaymentFieldKey, string>> = {}
  const valids: Partial<Record<PaymentFieldKey, boolean>> = {}
  for (const f of FIELDS) {
    const err = fieldError(f)
    if (touched[f] && err) errors[f] = err
    if (touched[f] && !err && formData[f].trim() !== '') valids[f] = true
  }

  const handleFieldChange = (field: PaymentFieldKey, value: string) => {
    const next = field === 'rif_pagador' || field === 'referencia_bancaria' ? soloNumeros(value) : value
    setFormData((prev) => ({ ...prev, [field]: next }))
  }

  const handleFieldBlur = (field: PaymentFieldKey) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const handleRemoveFile = () => {
    setCaptureFile(null)
    setPreview(null)
  }

  const maxFecha = new Date().toISOString().split('T')[0]
  const fade = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 } }

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-cyan" />
        </div>
      </DashboardLayout>
    )

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl font-body">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-semibold text-brand-navy sm:text-3xl">Solicitar plan de suscripción</h1>
          <p className="mt-1 text-sm text-brand-deep/60">Mejora tu visibilidad eligiendo un plan y registrando tu pago.</p>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              key={message.type + message.text}
              {...fade}
              className={`mb-6 flex items-start gap-2 rounded-lg border p-4 text-sm ${
                message.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              )}
              <div>
                <p className="font-semibold">{message.text}</p>
                {message.type === 'success' && (
                  <p className="mt-0.5 text-xs text-green-700">Tu solicitud será verificada en 24-48h. Te llevaremos a tu panel.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
            {/* Columna izquierda: flujo */}
            <div className="order-2 space-y-6 lg:order-1">
              <PlanSelector
                planes={planes}
                planId={planId}
                onSelectPlan={setPlanId}
                tipoPeriodo={tipoPeriodo}
                onChangePeriodo={setTipoPeriodo}
              />

              <section className="rounded-2xl border border-brand-cyan/15 bg-white p-6 shadow-[0_2px_16px_rgba(14,58,95,0.06)]">
                <h2 className="font-heading text-lg font-semibold text-brand-navy">Método de pago</h2>
                <div className="mt-4">
                  <PaymentMethodTabs metodos={METODOS_PAGO} value={metodoPago} onChange={setMetodoPago} />
                </div>
                <div className="mt-5">
                  <BankDetails metodoPago={metodoPago} />
                </div>
              </section>

              <section className="rounded-2xl border border-brand-cyan/15 bg-white p-6 shadow-[0_2px_16px_rgba(14,58,95,0.06)]">
                <h2 className="font-heading text-lg font-semibold text-brand-navy">Información de pago</h2>
                <div className="mt-5">
                  <PaymentForm
                    formData={formData}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                    errors={errors}
                    valids={valids}
                    referenciaLabel={getReferenciaLabel()}
                    referenciaPlaceholder={getReferenciaPlaceholder()}
                    maxFecha={maxFecha}
                  />
                </div>
                <div className="mt-6">
                  <span className="mb-2 flex items-center gap-1 text-sm font-semibold text-brand-deep/80">
                    Capture de pago <span className="text-red-500">*</span>
                  </span>
                  <ProofUpload
                    file={captureFile}
                    preview={preview}
                    onFile={processFile}
                    onRemove={handleRemoveFile}
                  />
                </div>
              </section>

              <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/empresa')}
                  className="rounded-lg border border-brand-cyan/30 px-5 py-2.5 text-sm font-semibold text-brand-deep/70 transition hover:bg-brand-cyanlt/40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-navy px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  )}
                  {submitting ? 'Enviando solicitud...' : 'Enviar Solicitud'}
                </button>
              </div>
            </div>

            {/* Columna derecha: resumen */}
            <div className="order-1 lg:order-2">
              <OrderSummary selectedPlan={selectedPlan ?? null} tipoPeriodo={tipoPeriodo} precioTotal={precioTotal} />
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
