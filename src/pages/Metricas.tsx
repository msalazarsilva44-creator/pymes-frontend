import { useEffect, useState } from 'react'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#00A3E0', '#10B981', '#8B5CF6']

export default function Metricas() {
  const [empresaId, setEmpresaId] = useState<number | null>(null)
  const [periodo, setPeriodo] = useState(30)
  const [metricas, setMetricas] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [resenasStats, setResenasStats] = useState({ total: 0, pendientes: 0, tasa: 0 })

  useEffect(() => {
    const init = async () => {
      try {
        const perfil = await api.get('/auth/me')
        const userData = perfil.data.data || perfil.data
        if (userData.empresa) {
          setEmpresaId(userData.empresa.id)
          await cargarDatos(userData.empresa.id, 30)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (empresaId) cargarDatos(empresaId, periodo)
  }, [periodo])

  const cargarDatos = async (empId: number, dias: number) => {
    try {
      const fechaFin = new Date()
      const fechaInicio = new Date()
      fechaInicio.setDate(fechaInicio.getDate() - dias)

      const [metRes, resRes] = await Promise.all([
        api.get(`/empresas/${empId}/metricas?fecha_inicio=${fechaInicio.toISOString().split('T')[0]}&fecha_fin=${fechaFin.toISOString().split('T')[0]}`),
        api.get(`/empresas/${empId}/resenas`),
      ])

      setMetricas(metRes.data.data)
      
      const resenas = resRes.data.data?.data || resRes.data.data || []
      const total = resenas.length
      const pendientes = resenas.filter((r: any) => !r.respuesta_empresa).length
      const respondidas = total - pendientes
      setResenasStats({
        total,
        pendientes,
        tasa: total > 0 ? Math.round((respondidas / total) * 100) : 0
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan"/></div></DashboardLayout>
  if (!metricas) return <DashboardLayout><div className="p-6 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-700">Error cargando métricas</p></div></DashboardLayout>

  const resumen = metricas.resumen?.periodo || {}
  const totalVistas = resumen.vistas || 0
  const totalClics = (resumen.clics_telefono || 0) + (resumen.clics_whatsapp || 0) + (resumen.clics_sitio_web || 0)
  const conversion = totalVistas > 0 ? ((totalClics / totalVistas) * 100).toFixed(1) : 0
  const calificacion = parseFloat(metricas.resumen?.calificacion_promedio) || 0

  // Preparar datos para gráficos
  const metricasLista = metricas.metricas || []
  const metricasPorFecha: Record<string, any> = {}
  metricasLista.forEach((m: any) => {
    if (!metricasPorFecha[m.fecha]) metricasPorFecha[m.fecha] = { vistas: 0, clics: 0 }
    if (m.tipo === 'vista') metricasPorFecha[m.fecha].vistas = parseInt(m.total)
    else metricasPorFecha[m.fecha].clics += parseInt(m.total)
  })
  const fechas = Object.keys(metricasPorFecha).sort()
  const datosGrafico = fechas.map(f => ({ fecha: formatDate(f), vistas: metricasPorFecha[f].vistas, clics: metricasPorFecha[f].clics }))

  const datosDonut = [
    { name: 'Teléfono', value: resumen.clics_telefono || 0 },
    { name: 'WhatsApp', value: resumen.clics_whatsapp || 0 },
    { name: 'Web', value: resumen.clics_sitio_web || 0 }
  ].filter(d => d.value > 0)

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Métricas y Analíticas</h1>
          <p className="text-gray-600">Análisis detallado del desempeño de tu empresa</p>
        </div>
        <select value={periodo} onChange={e => setPeriodo(parseInt(e.target.value))} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan">
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 3 meses</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Vistas Totales" value={totalVistas} icon="👁️" />
        <StatCard label="Clics Totales" value={totalClics} icon="📞" />
        <StatCard label="Calificación" value={calificacion.toFixed(1)} icon="⭐" />
        <StatCard label="Conversión" value={`${conversion}%`} icon="💰" />
      </div>

      {/* Gráfico de evolución */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Evolución de Vistas y Clics</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="vistas" stroke="#00A3E0" name="Vistas" />
              <Line type="monotone" dataKey="clics" stroke="#8B5CF6" name="Clics" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Breakdown de clics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📱 Tipos de Interacción</h2>
          <div className="space-y-4">
            <ProgressBar label="📞 Teléfono" value={resumen.clics_telefono || 0} total={totalClics} color="bg-blue-600" />
            <ProgressBar label="💬 WhatsApp" value={resumen.clics_whatsapp || 0} total={totalClics} color="bg-green-600" />
            <ProgressBar label="🌐 Sitio Web" value={resumen.clics_sitio_web || 0} total={totalClics} color="bg-purple-600" />
          </div>
        </div>

        {/* Gráfico de donut */}
        {datosDonut.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🎯 Distribución de Clics</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={datosDonut} cx="50%" cy="50%" outerRadius={80} label>
                    {datosDonut.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-center h-64">
            <p className="text-gray-500">Sin datos de clics</p>
          </div>
        )}
      </div>

      {/* Stats de reseñas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💬 Gestión de Reseñas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReviewCard label="Reseñas Totales" value={resenasStats.total} color="mercarof-cyan" />
          <ReviewCard label="Sin Responder" value={resenasStats.pendientes} color="orange" />
          <ReviewCard label="Tasa de Respuesta" value={`${resenasStats.tasa}%`} color="green" />
        </div>
      </div>

      {/* Sugerencias */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-mercarof-cyan/20 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Sugerencias</h2>
        <Sugerencias metricas={metricas} />
      </div>

      {/* Tabla de métricas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Detalle por Fecha</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vistas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fechas.reverse().map(f => {
                const m = metricasPorFecha[f]
                const conv = m.vistas > 0 ? ((m.clics / m.vistas) * 100).toFixed(1) : 0
                return (
                  <tr key={f} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{formatDate(f)}</td>
                    <td className="px-6 py-4 text-sm">{m.vistas}</td>
                    <td className="px-6 py-4 text-sm">{m.clics}</td>
                    <td className="px-6 py-4 text-sm font-medium">{conv}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm font-medium">{icon} {label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function ProgressBar({ label, value, total, color }: any) {
  const porcentaje = total > 0 ? ((value / total) * 100).toFixed(0) : 0
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value} ({porcentaje}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className={`${color} h-3 rounded-full transition-all`} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  )
}

function ReviewCard({ label, value, color }: any) {
  const colors: Record<string, string> = {
    'mercarof-cyan': 'bg-mercarof-cyan/10 border-mercarof-cyan',
    'orange': 'bg-orange-50 border-orange-500',
    'green': 'bg-green-50 border-green-500'
  }
  return (
    <div className={`${colors[color]} rounded-lg p-4 border-l-4`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Sugerencias({ metricas }: any) {
  const resumen = metricas.resumen?.periodo || {}
  const totalVistas = resumen.vistas || 0
  const totalClics = (resumen.clics_telefono || 0) + (resumen.clics_whatsapp || 0) + (resumen.clics_sitio_web || 0)
  const conversion = totalVistas > 0 ? (totalClics / totalVistas) * 100 : 0
  const calificacion = parseFloat(metricas.resumen?.calificacion_promedio) || 0
  const resenasTotales = metricas.resumen?.resenas_totales || 0

  const sugerencias: any[] = []
  if (totalVistas > 50 && conversion < 15) sugerencias.push({ icon: '⚠️', text: 'Muchas vistas pero baja conversión. Mejora tu descripción y fotos.', type: 'warning' })
  if (conversion >= 30) sugerencias.push({ icon: '💰', text: '¡Excelente conversión! Más del 30% de visitantes interactúan.', type: 'success' })
  if (calificacion < 4.0 && resenasTotales > 5) sugerencias.push({ icon: '⭐', text: 'Calificación bajo 4.0. Responde a reseñas negativas.', type: 'error' })
  if (totalVistas < 20) sugerencias.push({ icon: '📈', text: 'Pocas vistas. Considera mejorar tu plan para más visibilidad.', type: 'info' })
  if (sugerencias.length === 0) sugerencias.push({ icon: '👍', text: 'Tu empresa funciona bien. Sigue actualizando tu perfil.', type: 'info' })

  return (
    <div className="space-y-3">
      {sugerencias.map((s, i) => (
        <div key={i} className={`flex items-start gap-3 p-4 bg-white rounded-lg border-l-4 ${
          s.type === 'success' ? 'border-green-500' : s.type === 'warning' ? 'border-yellow-500' : s.type === 'error' ? 'border-red-500' : 'border-mercarof-cyan'
        }`}>
          <span className="text-2xl">{s.icon}</span>
          <p className="text-sm text-gray-700">{s.text}</p>
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
