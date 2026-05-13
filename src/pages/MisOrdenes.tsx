import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import Navbar from '../components/Navbar'
import { Package, ChevronRight, Clock, Loader2 } from 'lucide-react'

interface Orden {
  id: number
  numero_orden: string
  empresa_id: number
  empresa?: { id: number; nombre_comercial: string; logo?: string }
  total: number | string
  estado: string
  estado_label?: string
  estado_color?: string
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

export default function MisOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await api.get('/mis-ordenes')
      setOrdenes(res.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  const fmtDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return iso }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
        <p className="text-gray-600 mb-8">Historial de tus compras en Mercarof</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-mercarof-cyan" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
        ) : ordenes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes pedidos</h2>
            <p className="text-gray-600 mb-6">Explora el marketplace y realiza tu primera compra.</p>
            <Link to="/marketplace" className="inline-block px-6 py-3 bg-mercarof-navy text-white font-semibold rounded-xl hover:bg-mercarof-cyan transition-colors">
              Ir al marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordenes.map(orden => (
              <Link
                key={orden.id}
                to={`/mis-ordenes/${orden.id}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-md p-5 transition-all border border-transparent hover:border-mercarof-cyan"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {orden.empresa?.logo ? (
                      <img src={`http://localhost:8000/storage/${orden.empresa.logo}`} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-mercarof-navy to-mercarof-cyan text-white flex items-center justify-center font-bold text-lg shrink-0">
                        {orden.empresa?.nombre_comercial?.charAt(0) || 'E'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-mercarof-navy">{orden.numero_orden}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${estadoColor[orden.estado] || 'bg-gray-100 text-gray-700'}`}>
                          {estadoLabel[orden.estado] || orden.estado}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mt-1">{orden.empresa?.nombre_comercial}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtDate(orden.created_at)}</span>
                        <span>• {orden.items.length} item{orden.items.length !== 1 ? 's' : ''}</span>
                        <span>• {orden.tipo_entrega === 'digital' ? 'Digital' : 'Entrega física'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg text-mercarof-navy">${Number(orden.total).toFixed(2)}</p>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
