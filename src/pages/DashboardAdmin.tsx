import { useEffect, useState } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import { Users, Building2, Wrench, TrendingUp } from 'lucide-react'

export default function DashboardAdmin() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-xl p-6 text-white mb-8">
        <h2 className="text-2xl font-bold mb-1">Panel de Administración</h2>
        <p className="text-white/60">Gestiona la plataforma MERCAROF</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Usuarios"
          value={stats?.total_usuarios ?? 0}
          icon={<Users className="w-5 h-5" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Empresas"
          value={stats?.total_empresas ?? 0}
          icon={<Building2 className="w-5 h-5" />}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Servicios"
          value={stats?.total_servicios ?? 0}
          icon={<Wrench className="w-5 h-5" />}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          label="Nuevos hoy"
          value={stats?.nuevos_hoy ?? 0}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-orange-100 text-orange-600"
        />
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
