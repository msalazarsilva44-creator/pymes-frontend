import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import {
  DollarSign, ShoppingCart, Eye, Star, Download, X, TrendingUp, TrendingDown,
  Search, ChevronLeft, ChevronRight, Filter, FileText, FileSpreadsheet, Clock,
  CheckCircle2, XCircle, ArrowRight
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts'

// ============================================================
// DATOS MOCKEADOS — simulan una empresa de plomería / hogar
// ============================================================

const COLORS = {
  primary: '#0E9AA7',
  secondary: '#1A5276',
  accent: '#F39C12',
  success: '#27AE60',
  error: '#E74C3C',
  navy: '#0D3B66',
}

function generarIngresosLinea(dias: number) {
  const data = []
  const hoy = new Date()
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoy)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
    const base = 800 + Math.random() * 1200
    data.push({ fecha: label, ingresos: Math.round(base * 100) / 100 })
  }
  return data
}

const distribucionTipo = [
  { name: 'Servicios', value: 68 },
  { name: 'Productos', value: 32 },
]

const ordenesPorDia = [
  { dia: 'Lun', ordenes: 12 },
  { dia: 'Mar', ordenes: 8 },
  { dia: 'Mié', ordenes: 15 },
  { dia: 'Jue', ordenes: 10 },
  { dia: 'Vie', ordenes: 18 },
  { dia: 'Sáb', ordenes: 22 },
  { dia: 'Dom', ordenes: 6 },
]

const topProductos = [
  { nombre: 'Reparación de tuberías', ventas: 45 },
  { nombre: 'Instalación de grifería', ventas: 38 },
  { nombre: 'Destapado de cañerías', ventas: 32 },
  { nombre: 'Mantenimiento calentador', ventas: 24 },
  { nombre: 'Kit herramientas plomería', ventas: 18 },
]

const estadosBadge: Record<string, { bg: string; text: string; label: string }> = {
  completado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' },
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
}

function generarTransacciones(n: number) {
  const servicios = ['Reparación de tuberías', 'Instalación de grifería', 'Destapado de cañerías', 'Mantenimiento calentador', 'Kit herramientas plomería', 'Llave de paso 3/4"', 'Revisión general']
  const estados = ['completado', 'pendiente', 'cancelado']
  const txs = []
  const hoy = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(hoy)
    d.setDate(d.getDate() - Math.floor(Math.random() * 30))
    txs.push({
      id: i + 1,
      numero_orden: `ORD-${String(2000 + i).padStart(4, '0')}`,
      cliente: `Cliente #${String(i + 1).padStart(3, '0')}`,
      servicio: servicios[Math.floor(Math.random() * servicios.length)],
      monto: Math.round((150 + Math.random() * 850) * 100) / 100,
      estado: estados[Math.floor(Math.random() * estados.length)],
      fecha: d.toISOString(),
    })
  }
  return txs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

const TRANSACCIONES = generarTransacciones(47)

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

type Rango = '1' | '7' | '30' | '90' | 'custom'

export default function Reportes() {
  const [rango, setRango] = useState<Rango>('30')
  const [loaded, setLoaded] = useState(false)
  const [exportModal, setExportModal] = useState(false)

  // Tabla
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const porPagina = 10

  // Animación fade-in
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50)
    return () => clearTimeout(t)
  }, [])

  const dias = rango === 'custom' ? 30 : Number(rango)
  const datosLinea = generarIngresosLinea(dias)
  const ingresosTotales = datosLinea.reduce((s, d) => s + d.ingresos, 0)

  // Filtro tabla
  const txFiltradas = TRANSACCIONES.filter(tx => {
    if (filtroEstado !== 'todos' && tx.estado !== filtroEstado) return false
    if (busqueda && !tx.numero_orden.toLowerCase().includes(busqueda.toLowerCase())) return false
    return true
  })
  const totalPaginas = Math.ceil(txFiltradas.length / porPagina)
  const txPagina = txFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina)

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtMoney = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const rangos: { value: Rango; label: string }[] = [
    { value: '1', label: 'Hoy' },
    { value: '7', label: '7 días' },
    { value: '30', label: '30 días' },
    { value: '90', label: '90 días' },
    { value: 'custom', label: 'Personalizado' },
  ]

  // KPI cards data
  const kpis = [
    { icon: DollarSign, label: 'Ingresos Totales', value: fmtMoney(ingresosTotales), change: 12.5, up: true, color: COLORS.primary },
    { icon: ShoppingCart, label: 'Órdenes Recibidas', value: String(TRANSACCIONES.length), change: 8.3, up: true, color: COLORS.secondary },
    { icon: Eye, label: 'Vistas del Perfil', value: '1,284', change: -3.2, up: false, color: COLORS.accent },
    { icon: Star, label: 'Calificación Promedio', value: '4.7', change: 2.1, up: true, color: COLORS.success },
  ]

  const PIE_COLORS = [COLORS.primary, COLORS.secondary]

  return (
    <DashboardLayout>
      <div className={`transition-all duration-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ===== HEADER ===== */}
        <div className="rounded-2xl p-6 mb-6 text-white" style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.primary} 100%)` }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Reportes</h2>
              <p className="text-white/70 text-sm mt-1">Análisis detallado de tu negocio</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Selector de rango */}
              <div className="flex bg-white/15 rounded-xl overflow-hidden">
                {rangos.map(r => (
                  <button
                    key={r.value}
                    onClick={() => { setRango(r.value); setPagina(1) }}
                    className={`px-3 py-2 text-xs font-semibold transition-all ${
                      rango === r.value ? 'bg-white text-mercarof-navy' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {/* Exportar */}
              <button
                onClick={() => setExportModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                <Download className="w-4 h-4" />
                Exportar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* ===== KPI CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.color + '15' }}>
                    <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                    {kpi.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
              </div>
            )
          })}
        </div>

        {/* ===== GRÁFICAS FILA 1 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Ingresos por período */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold text-gray-900 mb-4">Ingresos por período</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosLinea}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    formatter={(value: any) => [fmtMoney(Number(value)), 'Ingresos']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                  />
                  <Line type="monotone" dataKey="ingresos" stroke={COLORS.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: COLORS.primary }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución por tipo */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold text-gray-900 mb-4">Distribución por tipo</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribucionTipo}
                    cx="50%" cy="45%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {distribucionTipo.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentaje']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ===== GRÁFICAS FILA 2 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Órdenes por día */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold text-gray-900 mb-4">Órdenes por día de la semana</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordenesPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                  <Bar dataKey="ordenes" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 productos */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold text-gray-900 mb-4">Top 5 Servicios / Productos</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductos} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11, fill: '#555' }} width={160} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                  <Bar dataKey="ventas" fill={COLORS.secondary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ===== TABLA TRANSACCIONES ===== */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h3 className="font-bold text-gray-900">Transacciones Recientes</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por # orden"
                    value={busqueda}
                    onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
                    className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none w-48"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filtroEstado}
                    onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }}
                    className="pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:outline-none appearance-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="completado">Completado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-5 py-3">#Orden</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-5 py-3">Cliente</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-5 py-3">Servicio/Producto</th>
                  <th className="text-right text-xs font-bold text-gray-500 uppercase px-5 py-3">Monto</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase px-5 py-3">Estado</th>
                  <th className="text-right text-xs font-bold text-gray-500 uppercase px-5 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {txPagina.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No se encontraron transacciones</td></tr>
                ) : txPagina.map(tx => {
                  const badge = estadosBadge[tx.estado] || estadosBadge.pendiente
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-mercarof-navy">{tx.numero_orden}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{tx.cliente}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{tx.servicio}</td>
                      <td className="px-5 py-3.5 text-sm text-right font-bold text-gray-900">{fmtMoney(tx.monto)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-right text-gray-500">{fmtDate(tx.fecha)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Mostrando {(pagina - 1) * porPagina + 1}-{Math.min(pagina * porPagina, txFiltradas.length)} de {txFiltradas.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(
                  Math.max(0, pagina - 3), Math.min(totalPaginas, pagina + 2)
                ).map(p => (
                  <button
                    key={p}
                    onClick={() => setPagina(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      p === pagina ? 'bg-mercarof-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===== MÉTRICAS DE CONVERSIÓN ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Funnel de conversión */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Tasa de Conversión</h4>
            <div className="space-y-3">
              {[
                { label: 'Vistas', value: 1284, pct: 100, color: COLORS.secondary },
                { label: 'Clics', value: 412, pct: 32, color: COLORS.primary },
                { label: 'Órdenes', value: 47, pct: 3.7, color: COLORS.success },
              ].map((step, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">{step.label}</span>
                    <span className="text-gray-500">{step.value.toLocaleString()} ({step.pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${step.pct}%`, backgroundColor: step.color }} />
                  </div>
                  {i < 2 && <div className="flex justify-center my-1"><ArrowRight className="w-3.5 h-3.5 text-gray-300 rotate-90" /></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Tiempo promedio de respuesta */}
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: COLORS.accent + '15' }}>
              <Clock className="w-7 h-7" style={{ color: COLORS.accent }} />
            </div>
            <p className="text-3xl font-bold text-gray-900">2.4h</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Tiempo promedio de respuesta</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-green-600">
              <TrendingUp className="w-3.5 h-3.5" /> -15% vs mes anterior
            </div>
          </div>

          {/* Completadas vs Canceladas */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Órdenes Completadas vs Canceladas</h4>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-2" style={{ backgroundColor: COLORS.success + '15' }}>
                  <CheckCircle2 className="w-6 h-6" style={{ color: COLORS.success }} />
                </div>
                <p className="text-2xl font-bold text-gray-900">82%</p>
                <p className="text-xs text-gray-500">Completadas</p>
              </div>
              <div className="w-px h-16 bg-gray-200" />
              <div className="flex-1 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-2" style={{ backgroundColor: COLORS.error + '15' }}>
                  <XCircle className="w-6 h-6" style={{ color: COLORS.error }} />
                </div>
                <p className="text-2xl font-bold text-gray-900">18%</p>
                <p className="text-xs text-gray-500">Canceladas</p>
              </div>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="h-full rounded-l-full" style={{ width: '82%', backgroundColor: COLORS.success }} />
              <div className="h-full rounded-r-full" style={{ width: '18%', backgroundColor: COLORS.error }} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL EXPORTAR ===== */}
      {exportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setExportModal(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Exportar Reporte</h3>
              <button onClick={() => setExportModal(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => { alert('Generando PDF...'); setExportModal(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-mercarof-cyan transition-all"
              >
                <FileText className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Descargar PDF</p>
                  <p className="text-xs text-gray-500">Reporte completo en formato PDF</p>
                </div>
              </button>
              <button
                onClick={() => { alert('Generando CSV...'); setExportModal(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-mercarof-cyan transition-all"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Descargar CSV</p>
                  <p className="text-xs text-gray-500">Datos en hoja de cálculo</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setExportModal(false)}
              className="w-full mt-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
