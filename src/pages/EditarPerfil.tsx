import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { Upload, X, Save } from 'lucide-react'

export default function EditarPerfil() {
  const navigate = useNavigate()
  const [empresa, setEmpresa] = useState<any>(null)
  const [categorias, setCategorias] = useState<any[]>([])
  const [ciudades, setCiudades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Form state
  const [form, setForm] = useState({
    nombre_comercial: '',
    rfc: '',
    categoria_id: '',
    ciudad_id: '',
    descripcion: '',
    telefono: '',
    email_contacto: '',
    direccion: '',
    sitio_web: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    ofrece_productos: false,
    ofrece_servicios: false
  })

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoExists, setLogoExists] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const [perfil, catRes, ciuRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/categorias'),
          api.get('/ciudades'),
        ])

        const userData = perfil.data.data || perfil.data
        if (userData.empresa) {
          setEmpresa(userData.empresa)
          setForm({
            nombre_comercial: userData.empresa.nombre_comercial || '',
            rfc: userData.empresa.rfc || '',
            categoria_id: userData.empresa.categoria_id || '',
            ciudad_id: userData.empresa.ciudad_id || '',
            descripcion: userData.empresa.descripcion || '',
            telefono: userData.empresa.telefono || '',
            email_contacto: userData.empresa.email_contacto || '',
            direccion: userData.empresa.direccion || '',
            sitio_web: userData.empresa.sitio_web || '',
            facebook: userData.empresa.facebook || '',
            instagram: userData.empresa.instagram || '',
            twitter: userData.empresa.twitter || '',
            linkedin: userData.empresa.linkedin || '',
            youtube: userData.empresa.youtube || '',
            tiktok: userData.empresa.tiktok || '',
            ofrece_productos: userData.empresa.ofrece_productos || false,
            ofrece_servicios: userData.empresa.ofrece_servicios || false
          })
          if (userData.empresa.logo) {
            setLogoPreview(userData.empresa.logo)
            setLogoExists(true)
          }
        }

        setCategorias(catRes.data.data || catRes.data || [])
        setCiudades(ciuRes.data.data || ciuRes.data || [])
      } catch (err) {
        console.error(err)
        setMessage({ text: 'Error cargando datos', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'El logo no debe superar 2MB', type: 'error' })
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubirLogo = async () => {
    if (!logoFile || !empresa) return
    try {
      const fd = new FormData()
      fd.append('logo', logoFile)
      await api.post(`/empresas/${empresa.id}/logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage({ text: 'Logo actualizado', type: 'success' })
      setLogoExists(true)
      setLogoFile(null)
    } catch (err) {
      setMessage({ text: 'Error al subir logo', type: 'error' })
    }
  }

  const handleEliminarLogo = async () => {
    if (!empresa || !confirm('¿Eliminar logo?')) return
    try {
      await api.delete(`/empresas/${empresa.id}/logo`)
      setMessage({ text: 'Logo eliminado', type: 'success' })
      setLogoPreview(null)
      setLogoExists(false)
    } catch (err) {
      setMessage({ text: 'Error al eliminar logo', type: 'error' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa) return

    // Validar que al menos una opción esté seleccionada
    if (!form.ofrece_productos && !form.ofrece_servicios) {
      setMessage({ text: 'Debes seleccionar al menos una opción: Productos o Servicios', type: 'error' })
      return
    }

    setSaving(true)

    try {
      await api.put(`/empresas/${empresa.id}`, form)
      setMessage({ text: 'Perfil actualizado', type: 'success' })
      setTimeout(() => navigate('/dashboard/empresa'), 1500)
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Error al guardar', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan"/></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">✏️ Editar Perfil de Empresa</h1>
        <p className="text-gray-600">Actualiza la información de tu negocio</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Logo de la Empresa</h2>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-5xl">🏢</span>}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Recomendado: 500x500px</p>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subir Logo</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              <p className="text-xs text-gray-500 mt-2">PNG, JPG hasta 2MB</p>
              <div className="flex gap-3 mt-4">
                {logoFile && <button type="button" onClick={handleSubirLogo} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2"><Upload className="w-4 h-4" /> Subir Logo</button>}
                {logoExists && <button type="button" onClick={handleEliminarLogo} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 flex items-center gap-2"><X className="w-4 h-4" /> Eliminar</button>}
              </div>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Información Básica</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Comercial *</label>
                <input required value={form.nombre_comercial} onChange={e => setForm({ ...form, nombre_comercial: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RIF/RUC</label>
                <input value={form.rfc} onChange={e => setForm({ ...form, rfc: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                <select required value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
                <select required value={form.ciudad_id} onChange={e => setForm({ ...form, ciudad_id: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Seleccionar...</option>
                  {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}, {c.estado}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea required rows={4} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Describe tu empresa..." />
            </div>
          </div>
        </div>

        {/* Configuración de Productos/Servicios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">¿Qué ofrece tu empresa?</h2>
          <p className="text-gray-600 mb-4">Selecciona al menos una opción para que tu empresa aparezca en las secciones correspondientes del Marketplace.</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ofrece_productos}
                onChange={e => setForm({ ...form, ofrece_productos: e.target.checked })}
                className="w-5 h-5 text-mercarof-cyan rounded"
              />
              <div>
                <span className="font-medium text-gray-900">📦 Productos</span>
                <p className="text-sm text-gray-500">Vende productos físicos o digitales</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ofrece_servicios}
                onChange={e => setForm({ ...form, ofrece_servicios: e.target.checked })}
                className="w-5 h-5 text-mercarof-cyan rounded"
              />
              <div>
                <span className="font-medium text-gray-900">🔧 Servicios</span>
                <p className="text-sm text-gray-500">Ofrece servicios profesionales</p>
              </div>
            </label>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Información de Contacto</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                <input required type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="+58 424 1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input required type="email" value={form.email_contacto} onChange={e => setForm({ ...form, email_contacto: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="contacto@empresa.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
              <textarea required rows={2} value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Calle, Número..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
              <input type="url" value={form.sitio_web} onChange={e => setForm({ ...form, sitio_web: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Redes Sociales (Opcional)</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📘 Facebook</label>
                <input type="url" value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📷 Instagram</label>
                <input type="url" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🐦 Twitter</label>
                <input type="url" value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">💼 LinkedIn</label>
                <input type="url" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">▶️ YouTube</label>
                <input type="url" value={form.youtube} onChange={e => setForm({ ...form, youtube: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🎵 TikTok</label>
                <input type="url" value={form.tiktok} onChange={e => setForm({ ...form, tiktok: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-mercarof-navy to-mercarof-cyan text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard/empresa')} className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </DashboardLayout>
  )
}
