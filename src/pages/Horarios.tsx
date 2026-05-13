import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { Save } from 'lucide-react'

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

export default function Horarios() {
  const navigate = useNavigate()
  const [horarios, setHorarios] = useState<Record<string, { activo: boolean; apertura: string; cierre: string }>>(
    Object.fromEntries(DIAS.map(d => [d, { activo: false, apertura: '08:00', cierre: '18:00' }]))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [empresaId, setEmpresaId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const perfil = await api.get('/auth/me')
        const userData = perfil.data.data || perfil.data
        if (userData.empresa) {
          setEmpresaId(userData.empresa.id)
          await cargarHorarios(userData.empresa.id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const cargarHorarios = async (empId: number) => {
    try {
      const res = await api.get(`/empresas/${empId}/horarios`)
      const data = res.data.data || []
      const nuevosHorarios = { ...horarios }
      data.forEach((h: any) => {
        const dia = h.dia_semana.toLowerCase()
        if (DIAS.includes(dia)) {
          nuevosHorarios[dia] = { activo: true, apertura: h.hora_apertura, cierre: h.hora_cierre }
        }
      })
      setHorarios(nuevosHorarios)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleDia = (dia: string) => {
    setHorarios({ ...horarios, [dia]: { ...horarios[dia], activo: !horarios[dia].activo } })
  }

  const aplicarATodos = () => {
    const apertura = prompt('Hora de apertura (HH:MM):', '08:00')
    const cierre = prompt('Hora de cierre (HH:MM):', '18:00')
    if (apertura && cierre) {
      const nuevos: Record<string, { activo: boolean; apertura: string; cierre: string }> = {}
      DIAS.forEach(d => { nuevos[d] = { activo: true, apertura, cierre } })
      setHorarios(nuevos)
      setMessage({ text: 'Horarios aplicados a todos los días', type: 'success' })
    }
  }

  const marcarLunesViernes = () => {
    const nuevos: Record<string, { activo: boolean; apertura: string; cierre: string }> = {}
    DIAS.forEach(d => {
      nuevos[d] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].includes(d)
        ? { activo: true, apertura: '08:00', cierre: '18:00' }
        : horarios[d]
    })
    setHorarios(nuevos)
    setMessage({ text: 'Horario de Lunes a Viernes configurado', type: 'success' })
  }

  const cerrarTodos = () => {
    const nuevos: Record<string, { activo: boolean; apertura: string; cierre: string }> = {}
    DIAS.forEach(d => { nuevos[d] = { ...horarios[d], activo: false } })
    setHorarios(nuevos)
    setMessage({ text: 'Todos los días marcados como cerrados', type: 'info' })
  }

  const guardarHorarios = async () => {
    if (!empresaId) return
    setSaving(true)
    const horariosArray = DIAS
      .filter(d => horarios[d].activo)
      .map(d => ({
        dia_semana: d.charAt(0).toUpperCase() + d.slice(1),
        hora_apertura: horarios[d].apertura,
        hora_cierre: horarios[d].cierre
      }))

    try {
      await api.post(`/empresas/${empresaId}/horarios`, { horarios: horariosArray })
      setMessage({ text: 'Horarios guardados exitosamente', type: 'success' })
      setTimeout(() => navigate('/dashboard/empresa'), 1500)
    } catch (err) {
      setMessage({ text: 'Error al guardar horarios', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan"/></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🕐 Horarios de Atención</h1>
        <p className="text-gray-600">Configura tus horarios para que los clientes sepan cuándo estás disponible</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="flex gap-3 flex-wrap">
          <button onClick={aplicarATodos} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium">
            📋 Aplicar mismo horario a todos
          </button>
          <button onClick={marcarLunesViernes} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium">
            💼 Lunes a Viernes (8:00-18:00)
          </button>
          <button onClick={cerrarTodos} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm font-medium">
            🚫 Cerrar todos
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {DIAS.map(dia => (
          <div key={dia} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={horarios[dia].activo}
                  onChange={() => toggleDia(dia)}
                  className="w-5 h-5 text-mercarof-cyan rounded"
                />
                <label className="text-lg font-semibold text-gray-900 capitalize">{dia}</label>
              </div>
              <span className={`text-sm font-medium ${horarios[dia].activo ? 'text-green-600' : 'text-red-600'}`}>
                {horarios[dia].activo ? 'Abierto' : 'Cerrado'}
              </span>
            </div>
            {horarios[dia].activo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Apertura</label>
                  <input
                    type="time"
                    value={horarios[dia].apertura}
                    onChange={e => setHorarios({ ...horarios, [dia]: { ...horarios[dia], apertura: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Cierre</label>
                  <input
                    type="time"
                    value={horarios[dia].cierre}
                    onChange={e => setHorarios({ ...horarios, [dia]: { ...horarios[dia], cierre: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={guardarHorarios} disabled={saving} className="flex-1 gradient-bg text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" /> {saving ? 'Guardando...' : 'Guardar Horarios'}
        </button>
        <button onClick={() => navigate('/dashboard/empresa')} className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </DashboardLayout>
  )
}
