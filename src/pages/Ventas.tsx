import { useEffect, useState } from 'react'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { Eye, ChevronLeft, ChevronRight, XCircle } from 'lucide-react'

export default function Ventas() {
  const [ordenes, setOrdenes] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, pendientes: 0, pagadas: 0, completadas: 0, monto_total: 0 })
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [itemsPorPagina, setItemsPorPagina] = useState(25)
  const [paginaActual, setPaginaActual] = useState(1)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    cargarOrdenes()
  }, [filtro])

  const cargarOrdenes = async () => {
    try {
      const res = await api.get(`/empresa/ordenes?estado=${filtro}`)
      setOrdenes(res.data.data || [])
      setStats(res.data.stats || { total: 0, pendientes: 0, pagadas: 0, completadas: 0, monto_total: 0 })
      setPaginaActual(1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalPaginas = Math.ceil(ordenes.length / itemsPorPagina)
  const inicio = (paginaActual - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  const ordenesPagina = ordenes.slice(inicio, fin)

  const getEstadoClasses = (estado: string) => {
    const classes: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'pagado': 'bg-blue-100 text-blue-800',
      'confirmado': 'bg-cyan-100 text-cyan-800',
      'completado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800',
    }
    return classes[estado] || 'bg-gray-100 text-gray-800'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'pendiente': '⏳ Pendiente',
      'pagado': '💳 Pagado',
      'confirmado': '✓ Confirmado',
      'completado': '✅ Completado',
      'cancelado': '❌ Cancelado',
    }
    return labels[estado] || estado
  }

  const getMetodoPagoLabel = (metodo: string) => {
    if (!metodo) return '-'
    const labels: Record<string, string> = {
      'paypal': '💳 PayPal',
      'binance': '🪙 Binance',
      'transferencia': '🏦 Transferencia',
      'pago_movil': '📱 Pago Móvil',
    }
    return labels[metodo] || metodo
  }

  const handleConfirmar = async (ordenId: number) => {
    if (!confirm('¿Confirmar que el pago fue recibido?')) return
    try {
      await api.put(`/empresa/ordenes/${ordenId}/confirmar`)
      await cargarOrdenes()
      setModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCompletar = async (ordenId: number) => {
    if (!confirm('¿Marcar esta orden como completada?')) return
    try {
      await api.put(`/empresa/ordenes/${ordenId}/completar`)
      await cargarOrdenes()
      setModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancelar = async (ordenId: number) => {
    if (!confirm('¿Estás seguro de cancelar esta orden?')) return
    try {
      await api.put(`/ordenes/${ordenId}/cancelar`)
      await cargarOrdenes()
      setModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const verOrden = (orden: any) => {
    setOrdenSeleccionada(orden)
    setModalOpen(true)
  }

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan"/></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="gradient-bg rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ventas y Órdenes</h1>
              <p className="text-white/80">Gestiona los pedidos de tus clientes</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <select value={filtro} onChange={e => setFiltro(e.target.value)} className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl">
              <option value="todos" className="text-gray-900">Todos</option>
              <option value="pendiente" className="text-gray-900">⏳ Pendientes</option>
              <option value="pagado" className="text-gray-900">💳 Por confirmar</option>
              <option value="confirmado" className="text-gray-900">✓ Confirmados</option>
              <option value="completado" className="text-gray-900">✅ Completados</option>
              <option value="cancelado" className="text-gray-900">❌ Cancelados</option>
            </select>
            <select value={itemsPorPagina} onChange={e => setItemsPorPagina(parseInt(e.target.value))} className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl">
              <option value="25" className="text-gray-900">25 por página</option>
              <option value="100" className="text-gray-900">100 por página</option>
              <option value="500" className="text-gray-900">500 por página</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Órdenes" value={stats.total} color="gray" />
        <StatCard label="Pendientes" value={stats.pendientes} color="yellow" />
        <StatCard label="Por Confirmar" value={stats.pagadas} color="blue" />
        <StatCard label="Completadas" value={stats.completadas} color="green" />
        <StatCard label="Ingresos" value={`$${Number(stats.monto_total || 0).toFixed(2)}`} color="navy" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Lista de Órdenes</h3>
          <span className="text-sm text-gray-500">
            {ordenes.length > 0 ? `Mostrando ${inicio + 1}-${Math.min(fin, ordenes.length)} de ${ordenes.length}` : 'Sin órdenes'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Orden</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Servicios</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Método</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordenesPagina.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500"><div className="text-5xl mb-4">📦</div><p>No hay órdenes</p></td></tr>
              ) : ordenesPagina.map((orden: any) => (
                <tr key={orden.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-mono text-sm text-gray-600">{orden.numero_orden}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900">{orden.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{orden.user?.email || ''}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{orden.items?.length || 0} servicio(s)</td>
                  <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoClasses(String(orden.estado))}`}>{getEstadoLabel(String(orden.estado))}</span></td>
                  <td className="px-4 py-4 text-sm text-gray-600">{getMetodoPagoLabel(orden.metodo_pago)}</td>
                  <td className="px-4 py-4 text-right font-bold text-mercarof-navy">${parseFloat(orden.total).toFixed(2)}</td>
                  <td className="px-4 py-4 text-right text-sm text-gray-500">{new Date(orden.created_at).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => verOrden(orden)} className="p-2 text-gray-500 hover:text-mercarof-cyan hover:bg-gray-100 rounded-lg"><Eye className="w-5 h-5" /></button>
                      {orden.estado === 'pagado' && <button onClick={() => handleConfirmar(orden.id)} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg">✓ Confirmar</button>}
                      {orden.estado === 'confirmado' && <button onClick={() => handleCompletar(orden.id)} className="px-3 py-1 bg-mercarof-cyan text-white text-xs font-bold rounded-lg">✓ Completar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <div className="flex gap-2">
            {[...Array(totalPaginas)].map((_, i) => {
              const page = i + 1
              if (page > 5) return null
              return (
                <button key={page} onClick={() => setPaginaActual(page)} className={`px-3 py-1 rounded-lg ${paginaActual === page ? 'bg-mercarof-cyan text-white' : 'hover:bg-gray-200'}`}>
                  {page}
                </button>
              )
            })}
          </div>
          <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual >= totalPaginas} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && ordenSeleccionada && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b bg-gradient-to-r from-mercarof-navy to-mercarof-cyan">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Detalle de Orden</h3>
                <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white"><XCircle className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500">Número de orden</p>
                  <p className="font-mono font-bold text-lg">{ordenSeleccionada.numero_orden}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoClasses(String(ordenSeleccionada.estado))}`}>{getEstadoLabel(String(ordenSeleccionada.estado))}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Cliente</p>
                <p className="font-bold text-gray-900">{ordenSeleccionada.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{ordenSeleccionada.user?.email || ''}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Servicios</p>
                <div className="space-y-2">
                  {(ordenSeleccionada.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{item.nombre_servicio}{item.cantidad > 1 ? ` ×${item.cantidad}` : ''}</p>
                        {item.descripcion_servicio && <p className="text-xs text-gray-500">{item.descripcion_servicio}</p>}
                      </div>
                      <p className="font-bold text-mercarof-cyan">${parseFloat(item.precio).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {ordenSeleccionada.metodo_pago && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600 mb-1">Método de pago</p>
                  <p className="font-bold text-blue-900">{getMetodoPagoLabel(ordenSeleccionada.metodo_pago)}</p>
                  {ordenSeleccionada.referencia_pago && <p className="text-sm text-blue-700">Ref: {ordenSeleccionada.referencia_pago}</p>}
                </div>
              )}
              {ordenSeleccionada.comprobante_pago && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Comprobante de pago</p>
                  <a href={ordenSeleccionada.comprobante_pago} target="_blank" className="text-mercarof-cyan hover:underline">Ver comprobante</a>
                </div>
              )}
              {ordenSeleccionada.notas_cliente && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-xs text-yellow-600 mb-1">Nota del cliente</p>
                  <p className="text-sm text-yellow-900">{ordenSeleccionada.notas_cliente}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm text-gray-700">{new Date(ordenSeleccionada.created_at).toLocaleString('es-ES')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-mercarof-navy">${parseFloat(ordenSeleccionada.total).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {ordenSeleccionada.estado === 'pagado' && <button onClick={() => handleConfirmar(ordenSeleccionada.id)} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl">✓ Confirmar Pago</button>}
                {ordenSeleccionada.estado === 'confirmado' && <button onClick={() => handleCompletar(ordenSeleccionada.id)} className="flex-1 bg-mercarof-cyan text-white font-bold py-3 rounded-xl">✓ Marcar Completado</button>}
                {['pendiente', 'pagado'].includes(ordenSeleccionada.estado) && <button onClick={() => handleCancelar(ordenSeleccionada.id)} className="px-6 bg-red-100 text-red-600 font-bold py-3 rounded-xl">Cancelar</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function StatCard({ label, value, color }: any) {
  const colors: Record<string, string> = {
    'gray': 'border-gray-400',
    'yellow': 'border-yellow-400 text-yellow-600',
    'blue': 'border-blue-400 text-blue-600',
    'green': 'border-green-400 text-green-600',
    'navy': 'border-mercarof-cyan text-mercarof-navy'
  }
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 text-center border-l-4 ${colors[color]}`}>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
