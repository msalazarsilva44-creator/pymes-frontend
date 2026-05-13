import { useState, useMemo } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { api } from '../services/api'
import {
  Search, ChevronLeft, ChevronRight, Download, X,
  FileText, FileSpreadsheet, ShoppingBag, DollarSign, Receipt,
  ArrowUpDown, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = {
  primary: '#0E9AA7',
  secondary: '#1A5276',
  navy: '#0D3B66',
}

const estadosBadge: Record<string, { bg: string; text: string; label: string }> = {
  completado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' },
  confirmado: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Confirmado' },
  pagado: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pagado' },
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
}

interface VentaRow {
  id: number
  orden_id: number
  numero_orden: string
  fecha: string
  cliente: string
  tipo: string
  nombre: string
  cantidad: number
  precio_unitario: number
  total: number
  estado: string
}

interface GraficaDia {
  fecha: string
  fecha_full: string
  servicios: number
  productos: number
}

type SortKey = 'fecha' | 'cliente' | 'nombre' | 'cantidad' | 'precio_unitario' | 'total' | 'estado'

export default function ReporteVentas() {
  // Filtros
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [tipo, setTipo] = useState('todos')

  // Data
  const [rows, setRows] = useState<VentaRow[]>([])
  const [kpis, setKpis] = useState({ total_ventas: 0, monto_total: 0, ticket_promedio: 0 })
  const [graficaDiaria, setGraficaDiaria] = useState<GraficaDia[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Tabla
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>('fecha')
  const [sortAsc, setSortAsc] = useState(false)
  const porPagina = 15

  // Export modal
  const [exportModal, setExportModal] = useState(false)

  const buscar = async () => {
    setLoading(true)
    setLoaded(false)
    try {
      const params: Record<string, string> = {}
      if (fechaDesde) params.fecha_desde = fechaDesde
      if (fechaHasta) params.fecha_hasta = fechaHasta
      if (tipo !== 'todos') params.tipo = tipo

      const res = await api.get('/empresa/reportes/ventas', { params })
      setRows(res.data.data || [])
      setKpis(res.data.kpis || { total_ventas: 0, monto_total: 0, ticket_promedio: 0 })
      setGraficaDiaria(res.data.grafica_diaria || [])
      setPagina(1)
      setLoaded(true)
    } catch (err) {
      console.error('Error cargando reporte ventas:', err)
    } finally {
      setLoading(false)
    }
  }

  const limpiar = () => {
    setFechaDesde('')
    setFechaHasta('')
    setTipo('todos')
    setRows([])
    setKpis({ total_ventas: 0, monto_total: 0, ticket_promedio: 0 })
    setGraficaDiaria([])
    setLoaded(false)
  }

  // Sorting + filtering
  const filteredRows = useMemo(() => {
    let result = [...rows]
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter(r =>
        r.nombre.toLowerCase().includes(q) ||
        r.cliente.toLowerCase().includes(q) ||
        r.numero_orden.toLowerCase().includes(q)
      )
    }
    result.sort((a, b) => {
      let va: any = a[sortKey]
      let vb: any = b[sortKey]
      if (sortKey === 'fecha') {
        va = new Date(va).getTime()
        vb = new Date(vb).getTime()
      }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb as string).toLowerCase() }
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1 : -1
      return 0
    })
    return result
  }, [rows, busqueda, sortKey, sortAsc])

  const totalPaginas = Math.ceil(filteredRows.length / porPagina)
  const rowsPagina = filteredRows.slice((pagina - 1) * porPagina, pagina * porPagina)

  // Subtotals
  const subtotalCantidad = filteredRows.reduce((s, r) => s + r.cantidad, 0)
  const subtotalTotal = filteredRows.reduce((s, r) => s + r.total, 0)

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return iso }
  }
  const fmtMoney = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase hover:text-gray-700 transition-colors"
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortKey === field ? 'text-mercarof-cyan' : 'text-gray-300'}`} />
    </button>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ===== HEADER ===== */}
        <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.primary} 100%)` }}>
          <h2 className="text-2xl font-bold">Reporte de Ventas</h2>
          <p className="text-white/70 text-sm mt-1">Detalle de cada venta por item con filtros avanzados</p>
        </div>

        {/* ===== FILTROS ===== */}
        <div className="bg-white rounded-2xl p-5 sticky top-[73px] z-30" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={e => setFechaDesde(e.target.value)}
                className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={e => setFechaHasta(e.target.value)}
                className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
              <div className="flex bg-gray-100 rounded-xl overflow-hidden">
                {(['todos', 'servicio', 'producto'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`px-4 py-2 text-xs font-semibold transition-all ${
                      tipo === t ? 'bg-mercarof-navy text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t === 'todos' ? 'Todos' : t === 'servicio' ? 'Servicios' : 'Productos'}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={buscar}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-mercarof-cyan text-white rounded-xl text-sm font-semibold hover:bg-mercarof-cyan/90 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Buscar
            </button>
            <button
              onClick={limpiar}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              Limpiar filtros
            </button>
            <button
              onClick={() => setExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all ml-auto"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* ===== KPI CARDS ===== */}
        {loaded && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: ShoppingBag, label: 'Total de Ventas', value: String(kpis.total_ventas), color: COLORS.primary },
              { icon: DollarSign, label: 'Monto Total Generado', value: fmtMoney(kpis.monto_total), color: COLORS.secondary },
              { icon: Receipt, label: 'Ticket Promedio', value: fmtMoney(kpis.ticket_promedio), color: '#F39C12' },
            ].map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-5 transition-all duration-300 hover:shadow-lg" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.color + '15' }}>
                      <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      <p className="text-xs text-gray-500">{kpi.label}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ===== TABLA ===== */}
        {loaded && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h3 className="font-bold text-gray-900">Detalle de Ventas</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por item, cliente u orden..."
                  value={busqueda}
                  onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
                  className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">#</th>
                    <th className="px-5 py-3 text-left"><SortHeader label="Fecha" field="fecha" /></th>
                    <th className="px-5 py-3 text-left"><SortHeader label="Cliente" field="cliente" /></th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tipo</th>
                    <th className="px-5 py-3 text-left"><SortHeader label="Nombre del Item" field="nombre" /></th>
                    <th className="px-5 py-3 text-right"><SortHeader label="Cantidad" field="cantidad" /></th>
                    <th className="px-5 py-3 text-right"><SortHeader label="P. Unitario" field="precio_unitario" /></th>
                    <th className="px-5 py-3 text-right"><SortHeader label="Total" field="total" /></th>
                    <th className="px-5 py-3 text-center"><SortHeader label="Estado" field="estado" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rowsPagina.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No se encontraron ventas para los filtros seleccionados</td></tr>
                  ) : rowsPagina.map((r, idx) => {
                    const badge = estadosBadge[r.estado] || estadosBadge.pendiente
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm text-gray-400">{(pagina - 1) * porPagina + idx + 1}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{fmtDate(r.fecha)}</td>
                        <td className="px-5 py-3 text-sm text-gray-700">{r.cliente}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            r.tipo === 'servicio' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {r.tipo === 'servicio' ? '🔧' : '📦'} {r.tipo === 'servicio' ? 'Servicio' : 'Producto'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{r.nombre}</td>
                        <td className="px-5 py-3 text-sm text-right text-gray-700">{r.cantidad}</td>
                        <td className="px-5 py-3 text-sm text-right text-gray-700">{fmtMoney(r.precio_unitario)}</td>
                        <td className="px-5 py-3 text-sm text-right font-bold text-mercarof-navy">{fmtMoney(r.total)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {filteredRows.length > 0 && (
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td colSpan={5} className="px-5 py-3 text-right text-xs font-bold text-gray-600 uppercase">Subtotales</td>
                      <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">{subtotalCantidad}</td>
                      <td className="px-5 py-3"></td>
                      <td className="px-5 py-3 text-right text-sm font-bold text-mercarof-navy">{fmtMoney(subtotalTotal)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Pagination */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Mostrando {(pagina - 1) * porPagina + 1}-{Math.min(pagina * porPagina, filteredRows.length)} de {filteredRows.length}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), Math.min(totalPaginas, pagina + 2)).map(p => (
                    <button key={p} onClick={() => setPagina(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === pagina ? 'bg-mercarof-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                  ))}
                  <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== GRÁFICA BARRAS AGRUPADAS ===== */}
        {loaded && graficaDiaria.length > 0 && (
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold text-gray-900 mb-4">Ventas por Día — Servicios vs Productos</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graficaDiaria}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    formatter={(value: any) => [fmtMoney(Number(value)), '']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="servicios" name="Servicios" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="productos" name="Productos" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-mercarof-cyan" />
          </div>
        )}
      </div>

      {/* ===== MODAL EXPORTAR ===== */}
      {exportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setExportModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Exportar Reporte</h3>
              <button onClick={() => setExportModal(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <button onClick={() => { alert('Generando PDF...'); setExportModal(false) }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-mercarof-cyan transition-all">
                <FileText className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Descargar PDF</p>
                  <p className="text-xs text-gray-500">Reporte de ventas en formato PDF</p>
                </div>
              </button>
              <button onClick={() => { alert('Generando CSV...'); setExportModal(false) }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-mercarof-cyan transition-all">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Descargar CSV</p>
                  <p className="text-xs text-gray-500">Datos en hoja de cálculo</p>
                </div>
              </button>
            </div>
            <button onClick={() => setExportModal(false)} className="w-full mt-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Cancelar</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
