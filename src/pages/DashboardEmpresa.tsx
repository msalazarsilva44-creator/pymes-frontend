import { useEffect, useState } from 'react'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { Eye, MousePointerClick, Star, MessageSquare, Settings, Package, ShoppingBag, BarChart3, Image as ImgIcon, CreditCard } from 'lucide-react'

export default function DashboardEmpresa() {
  const [data, setData] = useState<{ empresa: any; metricas: any }>({ empresa: null, metricas: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const perfil = await api.get('/auth/me')
        const userData = perfil.data.data || perfil.data
        if (!userData.empresa) { setError('No tienes una empresa asociada.'); setLoading(false); return }
        const empId = userData.empresa.id
        const [empRes, metRes] = await Promise.all([
          api.get(`/empresas/${empId}`),
          api.get(`/empresas/${empId}/metricas`),
        ])
        setData({ empresa: empRes.data.data, metricas: metRes.data.data })
      } catch (err: any) { setError(err.response?.data?.message || 'Error cargando datos') } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan"/></div></DashboardLayout>
  if (error) return <DashboardLayout><div className="p-6 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-700">{error}</p></div></DashboardLayout>

  const emp = data.empresa
  const m = data.metricas ?? { vistas_totales: 0, clics_totales: 0, promedio_calificacion: 0, total_resenas: 0, resenas_pendientes: 0 }
  const plan = emp?.plan?.nombre ?? 'Gratis'

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-r from-mercarof-navy to-mercarof-cyan rounded-xl p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">{emp?.nombre_comercial} 👋</h2>
            <p className="text-white/80">{emp?.slogan || 'Gestiona tu negocio en MERCAROF'}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-5 py-4 min-w-[160px]">
            <p className="text-sm text-white/80 mb-1">Plan Actual</p>
            <p className="text-xl font-bold">{plan}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Vistas" value={m.vistas_totales} icon={<Eye className="w-5 h-5" />} color="bg-blue-100 text-blue-600" />
        <StatCard label="Clics" value={m.clics_totales} icon={<MousePointerClick className="w-5 h-5" />} color="bg-green-100 text-green-600" />
        <StatCard label="Calificación" value={m.promedio_calificacion?.toFixed(1) || '0.0'} icon={<Star className="w-5 h-5" />} color="bg-yellow-100 text-yellow-600" />
        <StatCard label="Reseñas" value={m.total_resenas} icon={<MessageSquare className="w-5 h-5" />} color="bg-cyan-100 text-cyan-600" badge={m.resenas_pendientes || undefined} />
      </div>

      {(!emp?.aprobado) && <AlertBox title="Pendiente de aprobación" desc="Un administrador revisará tu información pronto." type="orange" />}
      {(emp?.aprobado && !emp?.verificado) && <AlertBox title="Verificación pendiente" desc="La verificación aumenta la confianza de los clientes." type="yellow" />}
      {(emp?.penalizada) && <AlertBox title="Empresa penalizada" desc={emp.razon_penalizacion || 'Contacta soporte.'} type="red" />}
      {(emp?.aprobado && !emp?.activo) && <AlertBox title="Empresa inactiva" desc="Revisa tu configuración o contacta soporte." type="orange" />}

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Accesos rápidos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickLink to="/dashboard/empresa/perfil" label="Editar Perfil" desc="Datos, logo, descripción" icon={<Settings className="w-5 h-5" />} />
        <QuickLink to="/dashboard/empresa/productos" label="Productos" desc="Gestiona tu catálogo" icon={<Package className="w-5 h-5" />} />
        <QuickLink to="/dashboard/empresa/ventas" label="Ventas" desc="Órdenes y transacciones" icon={<ShoppingBag className="w-5 h-5" />} />
        <QuickLink to="/dashboard/empresa/metricas" label="Métricas" desc="Estadísticas detalladas" icon={<BarChart3 className="w-5 h-5" />} />
        <QuickLink to="/dashboard/empresa/galeria" label="Galería" desc="Fotos de tu empresa" icon={<ImgIcon className="w-5 h-5" />} />
        <QuickLink to="/dashboard/empresa/pagos" label="Métodos de Pago" desc="Opciones de cobro" icon={<CreditCard className="w-5 h-5" />} />
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value, icon, color, badge }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
        <div className="flex-1"><p className="text-sm text-gray-500">{label}</p><p className="text-xl font-bold text-gray-900">{value}</p></div>
        {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{badge}</span>}
      </div>
    </div>
  )
}

function AlertBox({ title, desc, type }: any) {
  const c: Record<string,string> = { orange:'bg-orange-50 border-orange-400 text-orange-700', yellow:'bg-yellow-50 border-yellow-400 text-yellow-700', red:'bg-red-50 border-red-400 text-red-700' }
  return <div className={`mb-6 border-l-4 p-4 rounded-r-lg ${c[type]}`}><p className="font-semibold">{title}</p><p className="text-sm mt-1 opacity-90">{desc}</p></div>
}

function QuickLink({ to, label, desc, icon }: any) {
  return (
    <a href={to} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-mercarof-cyan/30 transition-all group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-mercarof-navy group-hover:bg-mercarof-cyan/10 transition-colors">{icon}</div>
        <div><p className="font-medium text-gray-900 group-hover:text-mercarof-navy">{label}</p><p className="text-sm text-gray-500">{desc}</p></div>
      </div>
    </a>
  )
}
