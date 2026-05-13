import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import Navbar from '../components/Navbar'
import { ArrowLeft, Package, MapPin, Phone, CreditCard, FileText, Loader2, CheckCircle2 } from 'lucide-react'

interface Orden {
  id: number
  numero_orden: string
  empresa?: { id: number; nombre_comercial: string; logo?: string }
  total: number | string
  subtotal: number | string
  estado: string
  metodo_pago: string
  referencia_pago?: string
  comprobante_pago?: string
  notas_cliente?: string
  notas_empresa?: string
  tipo_entrega: 'digital' | 'fisica'
  direccion_entrega?: string
  ciudad_entrega?: string
  municipio_entrega?: string
  referencia_entrega?: string
  telefono_contacto?: string
  created_at: string
  pagado_at?: string
  confirmado_at?: string
  completado_at?: string
  items: Array<{ id: number; nombre_servicio: string; descripcion_servicio?: string; cantidad: number; precio: number | string; tipo: string }>
}

const estadoStyle: Record<string, { bg: string; text: string; label: string }> = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente de pago' },
  pagado: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pago enviado - esperando confirmación' },
  confirmado: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Confirmado' },
  completado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
}

export default function OrdenDetail() {
  const { id } = useParams()
  const [orden, setOrden] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/ordenes/${id}`)
        setOrden(res.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'No se pudo cargar la orden')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const fmtDate = (iso?: string) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })
    } catch { return iso }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
        <Navbar />
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-mercarof-cyan" />
        </div>
      </div>
    )
  }

  if (error || !orden) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600 mb-4">{error || 'Orden no encontrada'}</p>
          <Link to="/mis-ordenes" className="text-mercarof-cyan font-semibold hover:underline">Volver a mis pedidos</Link>
        </div>
      </div>
    )
  }

  const est = estadoStyle[orden.estado] || { bg: 'bg-gray-100', text: 'text-gray-700', label: orden.estado }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/mis-ordenes" className="inline-flex items-center gap-2 text-gray-600 hover:text-mercarof-navy mb-6">
          <ArrowLeft className="w-5 h-5" /> <span className="font-medium">Volver a mis pedidos</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Orden</p>
              <h1 className="text-2xl font-bold text-mercarof-navy">{orden.numero_orden}</h1>
              <p className="text-sm text-gray-500 mt-1">{fmtDate(orden.created_at)}</p>
            </div>
            <span className={`${est.bg} ${est.text} px-4 py-2 rounded-full font-bold text-sm`}>
              {est.label}
            </span>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
            {orden.empresa?.logo ? (
              <img src={`http://localhost:8000/storage/${orden.empresa.logo}`} alt="" className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-mercarof-navy text-white flex items-center justify-center font-bold">
                {orden.empresa?.nombre_comercial?.charAt(0) || 'E'}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 uppercase">Vendido por</p>
              <p className="font-bold text-mercarof-navy">{orden.empresa?.nombre_comercial}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left column: Items + Payment */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-mercarof-navy mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Items ({orden.items.length})</h2>
              <div className="divide-y divide-gray-100">
                {orden.items.map(it => (
                  <div key={it.id} className="py-3 flex justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{it.nombre_servicio}</p>
                      {it.descripcion_servicio && <p className="text-xs text-gray-500 line-clamp-2">{it.descripcion_servicio}</p>}
                      <p className="text-xs text-gray-500 mt-1 capitalize">{it.tipo} • x{it.cantidad}</p>
                    </div>
                    <p className="font-bold text-mercarof-navy">${Number(it.precio).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                <span className="font-bold text-mercarof-navy">Total</span>
                <span className="font-bold text-xl text-mercarof-navy">${Number(orden.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-mercarof-navy mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Pago</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Método:</span> <span className="font-semibold capitalize">{orden.metodo_pago.replace('_', ' ')}</span></div>
                {orden.referencia_pago && <div><span className="text-gray-500">Referencia:</span> <span className="font-semibold">{orden.referencia_pago}</span></div>}
                {orden.pagado_at && <div><span className="text-gray-500">Pagado:</span> <span className="font-semibold">{fmtDate(orden.pagado_at)}</span></div>}
                {orden.confirmado_at && <div><span className="text-gray-500">Confirmado:</span> <span className="font-semibold">{fmtDate(orden.confirmado_at)}</span></div>}
              </div>
              {orden.comprobante_pago && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">Comprobante enviado</p>
                  <img src={`http://localhost:8000/storage/${orden.comprobante_pago}`} alt="Comprobante" className="max-h-64 rounded-xl border border-gray-200" />
                </div>
              )}
            </div>
          </div>

          {/* Right column: Entrega + notas */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-mercarof-navy mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> Entrega</h2>
              <p className="text-xs font-bold uppercase text-gray-500 mb-2">
                {orden.tipo_entrega === 'digital' ? 'Entrega digital' : 'Entrega física'}
              </p>
              {orden.tipo_entrega === 'fisica' && (
                <div className="text-sm text-gray-700 space-y-1">
                  {orden.direccion_entrega && <p>{orden.direccion_entrega}</p>}
                  {(orden.ciudad_entrega || orden.municipio_entrega) && (
                    <p className="text-gray-500">{[orden.municipio_entrega, orden.ciudad_entrega].filter(Boolean).join(', ')}</p>
                  )}
                  {orden.referencia_entrega && <p className="text-xs text-gray-500 italic">“{orden.referencia_entrega}”</p>}
                </div>
              )}
              {orden.telefono_contacto && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" /> {orden.telefono_contacto}
                </div>
              )}
            </div>

            {(orden.notas_cliente || orden.notas_empresa) && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-mercarof-navy mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Notas</h2>
                {orden.notas_cliente && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Tuyas</p>
                    <p className="text-sm text-gray-700">{orden.notas_cliente}</p>
                  </div>
                )}
                {orden.notas_empresa && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">De la empresa</p>
                    <p className="text-sm text-gray-700">{orden.notas_empresa}</p>
                  </div>
                )}
              </div>
            )}

            {orden.estado === 'completado' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-bold text-green-700">Pedido completado</p>
                <p className="text-xs text-green-600 mt-1">¡Gracias por comprar en Mercarof!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
