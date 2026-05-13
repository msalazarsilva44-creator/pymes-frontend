import { useEffect, useState } from 'react'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { MessageCircle, Send, X } from 'lucide-react'

export default function Resenas() {
  const [resenas, setResenas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('todas')
  const [modalOpen, setModalOpen] = useState(false)
  const [resenaActual, setResenaActual] = useState<any>(null)
  const [respuesta, setRespuesta] = useState('')
  const [empresaId, setEmpresaId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const perfil = await api.get('/auth/me')
        const userData = perfil.data.data || perfil.data
        if (userData.empresa) {
          setEmpresaId(userData.empresa.id)
          await cargarResenas(userData.empresa.id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const cargarResenas = async (empId: number) => {
    try {
      const res = await api.get(`/empresas/${empId}/resenas`)
      setResenas(res.data.data?.data || res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const stats = {
    total: resenas.length,
    pendientes: resenas.filter(r => !r.respuesta_empresa).length,
    rating: resenas.length > 0 ? (resenas.reduce((a, b) => a + b.calificacion, 0) / resenas.length).toFixed(1) : '0.0',
    tiempoRespuesta: calcularTiempoRespuesta()
  }

  const distribucion: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  resenas.forEach(r => { if (distribucion[r.calificacion as number] !== undefined) distribucion[r.calificacion as number]++ })

  const sugerencias = generarSugerencias()

  const resenasFiltradas = filtro === 'todas' 
    ? resenas 
    : filtro === 'pendientes' 
      ? resenas.filter(r => !r.respuesta_empresa)
      : resenas.filter(r => r.calificacion === parseInt(filtro))

  function calcularTiempoRespuesta() {
    const respondidas = resenas.filter(r => r.respuesta_empresa && r.respondido_at)
    if (respondidas.length === 0) return '-'
    let totalHoras = 0
    respondidas.forEach(r => {
      const created = new Date(r.created_at)
      const responded = new Date(r.respondido_at)
      totalHoras += Math.abs(responded.getTime() - created.getTime()) / 36e5
    })
    return Math.round(totalHoras / respondidas.length) + 'h'
  }

  function generarSugerencias() {
    const pendientes = resenas.filter(r => !r.respuesta_empresa)
    const sugerencias: any[] = []
    if (pendientes.length > 5) sugerencias.push({ icon: '⚠️', text: `Tienes ${pendientes.length} reseñas sin responder. Responde en menos de 24h.`, type: 'warning' })
    else if (pendientes.length > 0) sugerencias.push({ icon: '📝', text: `Tienes ${pendientes.length} reseña(s) pendiente(s). Responder genera 2x más conversión.`, type: 'info' })
    const bajas = resenas.filter(r => r.calificacion <= 2 && !r.respuesta_empresa)
    if (bajas.length > 0) sugerencias.push({ icon: '🔴', text: `Tienes ${bajas.length} reseña(s) negativa(s) sin responder.`, type: 'error' })
    if (resenas.length > 10 && pendientes.length === 0) sugerencias.push({ icon: '🎉', text: '¡Excelente! Has respondido todas tus reseñas.', type: 'success' })
    return sugerencias
  }

  const abrirModal = (resena: any) => {
    setResenaActual(resena)
    setRespuesta(resena.respuesta_empresa || '')
    setModalOpen(true)
  }

  const enviarRespuesta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resenaActual || respuesta.length < 10) return
    try {
      await api.post(`/resenas/${resenaActual.id}/responder`, { respuesta })
      setModalOpen(false)
      setRespuesta('')
      if (empresaId) await cargarResenas(empresaId)
    } catch (err) {
      console.error(err)
    }
  }

  const generarEstrellas = (calificacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < calificacion ? 'text-yellow-400' : 'text-gray-300'}>⭐</span>
    ))
  }

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha)
    const ahora = new Date()
    const dias = Math.floor((ahora.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (dias === 0) return 'hoy'
    if (dias === 1) return 'ayer'
    if (dias < 7) return `hace ${dias} días`
    if (dias < 30) return `hace ${Math.floor(dias / 7)} semanas`
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan"/></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Gestión de Reseñas</h1>
        <p className="text-gray-600">Responde a tus clientes y mejora tu reputación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="📝 Total Reseñas" value={stats.total} />
        <StatCard label="⏳ Sin Responder" value={stats.pendientes} color="orange" />
        <StatCard label="⭐ Rating" value={stats.rating} color="yellow" stars={true} />
        <StatCard label="⚡ T. Respuesta" value={stats.tiempoRespuesta} color="blue" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Distribución de Calificaciones</h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribucion[star as keyof typeof distribucion]
            const porcentaje = resenas.length > 0 ? (count / resenas.length) * 100 : 0
            const colors = { 5: 'bg-green-500', 4: 'bg-blue-500', 3: 'bg-yellow-500', 2: 'bg-orange-500', 1: 'bg-red-500' }
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-12">{star} ⭐</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div className={`${colors[star as keyof typeof colors]} h-3 rounded-full transition-all`} style={{ width: `${porcentaje}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-3">
          <FiltroBtn active={filtro === 'todas'} onClick={() => setFiltro('todas')}>Todas</FiltroBtn>
          <FiltroBtn active={filtro === 'pendientes'} onClick={() => setFiltro('pendientes')}>Sin Responder</FiltroBtn>
          {[5, 4, 3, 2, 1].map(star => (
            <FiltroBtn key={star} active={filtro === String(star)} onClick={() => setFiltro(String(star))}>{star} ⭐</FiltroBtn>
          ))}
        </div>
      </div>

      {sugerencias.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-mercarof-cyan/20 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Sugerencias</h3>
          <div className="space-y-3">
            {sugerencias.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 ${
                s.type === 'success' ? 'border-green-500' : s.type === 'warning' ? 'border-yellow-500' : s.type === 'error' ? 'border-red-500' : 'border-blue-500'
              }`}>
                <span className="text-2xl">{s.icon}</span>
                <p className="text-sm text-gray-700">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {resenasFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <span className="text-5xl mb-4 block">📭</span>
            <p className="text-gray-500 text-lg">No hay reseñas {filtro !== 'todas' ? 'con este filtro' : 'aún'}</p>
          </div>
        ) : resenasFiltradas.map((resena: any) => (
          <div key={resena.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-mercarof-navy to-mercarof-cyan rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(resena.user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{resena.user?.name || 'Usuario Anónimo'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {generarEstrellas(resena.calificacion)}
                    <span className="text-sm text-gray-500">• {formatFecha(resena.created_at)}</span>
                  </div>
                </div>
              </div>
              {!resena.respuesta_empresa ? (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">SIN RESPONDER</span>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ RESPONDIDA</span>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{resena.comentario || <em className="text-gray-400">Sin comentario</em>}</p>
            </div>

            {resena.respuesta_empresa && (
              <div className="bg-mercarof-cyan/10 rounded-lg p-4 border-l-4 border-mercarof-cyan mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-mercarof-navy">📢 Tu respuesta</span>
                  <span className="text-xs text-gray-500">• {formatFecha(resena.respondido_at)}</span>
                </div>
                <p className="text-gray-700 text-sm">{resena.respuesta_empresa}</p>
              </div>
            )}

            <div className="flex gap-3">
              {!resena.respuesta_empresa ? (
                <button onClick={() => abrirModal(resena)} className="flex-1 bg-mercarof-navy text-white font-semibold py-2 px-4 rounded-lg hover:bg-mercarof-navy-dark transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Responder
                </button>
              ) : (
                <button onClick={() => abrirModal(resena)} className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all">
                  ✏️ Editar Respuesta
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && resenaActual && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">💬 Responder a Reseña</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-mercarof-cyan">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-mercarof-navy to-mercarof-cyan rounded-full flex items-center justify-center text-white font-bold">
                  {(resenaActual.user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{resenaActual.user?.name || 'Usuario'}</h4>
                  <div className="flex items-center gap-2 mt-1">{generarEstrellas(resenaActual.calificacion)}</div>
                </div>
              </div>
              <p className="text-gray-700 mt-2">{resenaActual.comentario || <em className="text-gray-400">Sin comentario</em>}</p>
            </div>

            <form onSubmit={enviarRespuesta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tu Respuesta</label>
                <textarea
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="Escribe tu respuesta profesional aquí..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan resize-none"
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">Sé profesional y constructivo</p>
                  <p className="text-xs text-gray-500">{respuesta.length}/500</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 gradient-bg text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Publicar Respuesta
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function StatCard({ label, value, color = 'gray', stars = false }: any) {
  const colors: Record<string, string> = {
    'gray': 'border-l-4 border-gray-400',
    'orange': 'border-l-4 border-orange-500',
    'yellow': 'border-l-4 border-yellow-500',
    'blue': 'border-l-4 border-blue-500'
  }
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {stars && <div className="mt-1 text-yellow-400">⭐⭐⭐⭐⭐</div>}
      <p className="text-xs text-gray-500 mt-1">{color === 'orange' ? 'Requieren tu atención' : ''}</p>
    </div>
  )
}

function FiltroBtn({ active, onClick, children }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2 font-semibold rounded-lg transition-all ${active ? 'bg-mercarof-navy text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
      {children}
    </button>
  )
}
