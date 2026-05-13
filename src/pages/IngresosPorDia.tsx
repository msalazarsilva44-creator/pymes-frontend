import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { api } from '../services/api'
import {
  DollarSign, ShoppingCart, TrendingUp, Calendar, Search, Download, X,
  FileText, FileSpreadsheet, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = {
  primary: '#0E9AA7',
  secondary: '#1A5276',
  accent: '#F39C12',
  navy: '#0D3B66',
  success: '#27AE60',
}

interface DiaData {
  fecha: string
  fecha_full: string
  ingresos: number
  ordenes: number
}

interface MetodoPago {
  metodo: string
  ordenes: number
  monto: number
}

const metodoPagoLabels: Record<string, string> = {
  pago_movil: 'Pago Móvil',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  zelle: 'Zelle',
  punto_venta: 'Punto de Venta',
}
const PIE_COLORS = ['#0E9AA7', '#1A5276', '#F39C12', '#27AE60', '#E74C3C', '#8E44AD']

export default function IngresosPorDia() {
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const [kpis, setKpis] = useState<{
    total_ingresos: number; total_ordenes: number; promedio_diario: number;
    mejor_dia: { fecha: string; ingresos: number } | null
  }>({ total_ingresos: 0, total_ordenes: 0, promedio_diario: 0, mejor_dia: null })
  const [grafica, setGrafica] = useState<DiaData[]>([])
  const [porMetodo, setPorMetodo] = useState<MetodoPago[]>([])

  const [exportModal, setExportModal] = useState(false)

  const buscar = async () => {
    setLoading(true)
    setLoaded(false)
    try {
      const params: Record<string, string> = {}
      if (fechaDesde) params.fecha_desde = fechaDesde
      if (fechaHasta) params.fecha_hasta = fechaHasta

      const res = await api.get('/empresa/reportes/ingresos-dia', { params })
      setKpis(res.data.kpis || { total_ingresos: 0, total_ordenes: 0, promedio_diario: 0, mejor_dia: null })
      setGrafica(res.data.grafica || [])
      setPorMetodo(res.data.por_metodo || [])
      setLoaded(true)
    } catch (err) {
      console.error('Error cargando ingresos por día:', err)
    } finally {
      setLoading(false)
    }
  }

  const limpiar = () => {
    setFechaDesde('')
    setFechaHasta('')
    setGrafica([])
    setPorMetodo([])
    setKpis({ total_ingresos: 0, total_ordenes: 0, promedio_diario: 0, mejor_dia: null })
    setLoaded(false)
  }

  const fmtMoney = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return iso }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ===== HEADER ===== */}
        <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.primary} 100%)` }}>
          <h2 className="text-2xl font-bold">Ingresos por Día</h2>
          <p className="text-white/70 text-sm mt-1">Evolución diaria de ingresos y análisis por método de pago</p>
        </div>

        {/* ===== FILTROS ===== */}
        <div className="bg-white rounded-2xl p-5 sticky top-[73px] z-30" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Desde</label>
              <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Hasta</label>
              <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none" />
            </div>
            <button
              onClick={buscar}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-mercarof-cyan text-white rounded-xl text-sm font-semibold hover:bg-mercarof-cyan/90 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Buscar
            </button>
            <button onClick={limpiar} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">Limpiar</button>
            <button onClick={() => setExportModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all ml-auto">
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-mercarof-cyan" />
          </div>
        )}

        {/* ===== KPI CARDS ===== */}
        {loaded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: DollarSign, label: 'Ingresos Totales', value: fmtMoney(kpis.total_ingresos), color: COLORS.primary },
              { icon: ShoppingCart, label: 'Total Órdenes', value: String(kpis.total_ordenes), color: COLORS.secondary },
              { icon: TrendingUp, label: 'Promedio Diario', value: fmtMoney(kpis.promedio_diario), color: COLORS.accent },
              { icon: Calendar, label: 'Mejor Día', value: kpis.mejor_dia ? `${fmtDate(kpis.mejor_dia.fecha)} — ${fmtMoney(kpis.mejor_dia.ingresos)}` : 'N/A', color: COLORS.success },
            ].map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-5 transition-all duration-300 hover:shadow-lg" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: kpi.color + '15' }}>
                      <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-bold text-gray-900 truncate">{kpi.value}</p>
                      <p className="text-xs text-gray-500">{kpi.label}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ===== GRÁFICA PRINCIPAL: Ingresos + Órdenes ===== */}
        {loaded && grafica.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Barras ingresos */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 className="font-bold text-gray-900 mb-4">Ingresos Diarios</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={grafica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        name === 'ingresos' ? fmtMoney(Number(value)) : value,
                        name === 'ingresos' ? 'Ingresos' : 'Órdenes'
                      ]}
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                    />
                    <Bar dataKey="ingresos" name="ingresos" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Línea órdenes */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 className="font-bold text-gray-900 mb-4">Órdenes por Día</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={grafica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                    <Line type="monotone" dataKey="ordenes" stroke={COLORS.secondary} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.secondary }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ===== DISTRIBUCIÓN POR MÉTODO DE PAGO ===== */}
        {loaded && porMetodo.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 className="font-bold text-gray-900 mb-4">Distribución por Método de Pago</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={porMetodo.map(m => ({ ...m, name: metodoPagoLabels[m.metodo] || m.metodo }))}
                      cx="50%" cy="45%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={3}
                      dataKey="monto"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {porMetodo.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => [fmtMoney(Number(value)), 'Monto']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla resumen */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 className="font-bold text-gray-900 mb-4">Resumen por Método</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-bold text-gray-500 uppercase py-3">Método</th>
                    <th className="text-right text-xs font-bold text-gray-500 uppercase py-3">Órdenes</th>
                    <th className="text-right text-xs font-bold text-gray-500 uppercase py-3">Monto</th>
                    <th className="text-right text-xs font-bold text-gray-500 uppercase py-3">% del Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {porMetodo.map((m, i) => {
                    const totalMonto = porMetodo.reduce((s, x) => s + x.monto, 0)
                    const pct = totalMonto > 0 ? ((m.monto / totalMonto) * 100).toFixed(1) : '0'
                    return (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 text-sm text-gray-700 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            {metodoPagoLabels[m.metodo] || m.metodo}
                          </div>
                        </td>
                        <td className="py-3 text-sm text-right text-gray-600">{m.ordenes}</td>
                        <td className="py-3 text-sm text-right font-bold text-mercarof-navy">{fmtMoney(m.monto)}</td>
                        <td className="py-3 text-sm text-right text-gray-500">{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="border-t-2 border-gray-200">
                  <tr>
                    <td className="py-3 text-xs font-bold text-gray-600 uppercase">Total</td>
                    <td className="py-3 text-sm text-right font-bold text-gray-900">{porMetodo.reduce((s, m) => s + m.ordenes, 0)}</td>
                    <td className="py-3 text-sm text-right font-bold text-mercarof-navy">{fmtMoney(porMetodo.reduce((s, m) => s + m.monto, 0))}</td>
                    <td className="py-3 text-sm text-right font-bold text-gray-500">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {loaded && grafica.length === 0 && !loading && (
          <div className="bg-white rounded-2xl p-10 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Calendar className="w-14 h-14 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No hay datos de ingresos para el rango seleccionado</p>
            <p className="text-gray-400 text-sm mt-1">Prueba con un rango de fechas diferente</p>
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
                  <p className="text-xs text-gray-500">Reporte de ingresos en formato PDF</p>
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
