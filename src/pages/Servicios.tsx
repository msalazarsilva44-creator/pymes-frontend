import { useEffect, useState, useRef } from 'react'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { Plus, Edit2, Trash2, X, Wrench, Send, Upload, Image as ImageIcon, Eye, ChevronDown, ChevronUp } from 'lucide-react'

type ServicioForm = {
  nombre: string
  descripcion: string
  precio: string
  activo: boolean
}

const emptyForm: ServicioForm = {
  nombre: '',
  descripcion: '',
  precio: '',
  activo: true,
}

const MAX_SERVICIOS = 5
const MAX_IMAGENES_POR_SERVICIO = 4

// Resuelve URLs relativas (/storage/...) contra el host del backend (api baseURL menos /api)
const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')
const resolveImgUrl = (url: string | undefined | null): string => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${BACKEND_HOST}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function Servicios() {
  const [servicios, setServicios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [publicando, setPublicando] = useState(false)
  const [form, setForm] = useState<ServicioForm>(emptyForm)
  const [editando, setEditando] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [empresaId, setEmpresaId] = useState<number | null>(null)

  // Subida de imágenes por servicio
  const [uploadingServId, setUploadingServId] = useState<number | null>(null)
  const servicioFileInputRef = useRef<HTMLInputElement>(null)
  const [pendingUploadServId, setPendingUploadServId] = useState<number | null>(null)

  // Galería de fotos de la empresa (preservado de Galeria)
  const [fotos, setFotos] = useState<any[]>([])
  const [showGaleria, setShowGaleria] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fotoDescripcion, setFotoDescripcion] = useState('')
  const [fotoModal, setFotoModal] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const limiteAlcanzado = servicios.length >= MAX_SERVICIOS

  useEffect(() => {
    const init = async () => {
      try {
        const perfil = await api.get('/auth/me')
        const userData = perfil.data.data || perfil.data
        if (userData.empresa) {
          setEmpresaId(userData.empresa.id)
          await Promise.all([
            cargarServicios(userData.empresa.id),
            cargarGaleria(userData.empresa.id),
          ])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Auto-ocultar mensajes
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

  const cargarServicios = async (empId: number) => {
    try {
      const res = await api.get(`/empresas/${empId}/servicios`)
      setServicios(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cargarGaleria = async (empId: number) => {
    try {
      const res = await api.get(`/empresas/${empId}/fotos`)
      setFotos(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  // ========================== Servicios CRUD ==========================
  const publicarServicio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresaId) return
    if (!form.nombre.trim()) {
      setMessage({ text: 'El nombre del servicio es obligatorio', type: 'error' })
      return
    }
    if (limiteAlcanzado) {
      setMessage({ text: `Has alcanzado el límite máximo de ${MAX_SERVICIOS} servicios. Elimina uno antes de crear otro.`, type: 'error' })
      return
    }
    setPublicando(true)
    try {
      const payload: any = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion || null,
        precio: form.precio || null,
        activo: form.activo,
      }
      await api.post(`/empresas/${empresaId}/servicios`, payload)
      setMessage({ text: '¡Servicio publicado exitosamente!', type: 'success' })
      setForm(emptyForm)
      await cargarServicios(empresaId)
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Error al publicar el servicio',
        type: 'error',
      })
    } finally {
      setPublicando(false)
    }
  }

  const editarServicio = (servicio: any) => {
    setEditando({ ...servicio })
    setModalOpen(true)
  }

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresaId || !editando) return
    try {
      const payload: any = {
        nombre: editando.nombre,
        descripcion: editando.descripcion || null,
        precio: editando.precio || null,
        activo: !!editando.activo,
      }
      await api.put(`/empresas/${empresaId}/servicios/${editando.id}`, payload)
      setMessage({ text: 'Servicio actualizado exitosamente', type: 'success' })
      setModalOpen(false)
      setEditando(null)
      await cargarServicios(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al actualizar el servicio', type: 'error' })
    }
  }

  const eliminarServicio = async (id: number) => {
    if (!empresaId || !confirm('¿Eliminar este servicio?')) return
    try {
      await api.delete(`/empresas/${empresaId}/servicios/${id}`)
      setMessage({ text: 'Servicio eliminado', type: 'success' })
      await cargarServicios(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al eliminar el servicio', type: 'error' })
    }
  }

  // ========================== Imágenes por Servicio ==========================
  const triggerSubirImagenServicio = (servId: number) => {
    setPendingUploadServId(servId)
    servicioFileInputRef.current?.click()
  }

  const onServicioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !empresaId || !pendingUploadServId) return
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'La imagen no debe superar 5MB', type: 'error' })
      setPendingUploadServId(null)
      return
    }
    const servId = pendingUploadServId
    setUploadingServId(servId)
    try {
      const fd = new FormData()
      fd.append('imagen', file)
      await api.post(`/empresas/${empresaId}/servicios/${servId}/imagenes`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage({ text: 'Imagen agregada', type: 'success' })
      await cargarServicios(empresaId)
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Error al subir la imagen',
        type: 'error',
      })
    } finally {
      setUploadingServId(null)
      setPendingUploadServId(null)
    }
  }

  const eliminarImagenServicio = async (servId: number, imagenId: number) => {
    if (!empresaId || !confirm('¿Eliminar esta imagen?')) return
    try {
      await api.delete(`/empresas/${empresaId}/servicios/${servId}/imagenes/${imagenId}`)
      setMessage({ text: 'Imagen eliminada', type: 'success' })
      await cargarServicios(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al eliminar la imagen', type: 'error' })
    }
  }

  // ========================== Galería ==========================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) selectFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) selectFile(file)
  }

  const selectFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'La imagen no debe superar 5MB', type: 'error' })
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const cancelarUpload = () => {
    setSelectedFile(null)
    setPreview(null)
    setFotoDescripcion('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const subirFoto = async () => {
    if (!selectedFile || !empresaId) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('foto', selectedFile)
      fd.append('descripcion', fotoDescripcion)
      await api.post(`/empresas/${empresaId}/fotos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage({ text: 'Foto subida exitosamente', type: 'success' })
      cancelarUpload()
      await cargarGaleria(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al subir la foto', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const eliminarFoto = async (fotoId: number) => {
    if (!empresaId || !confirm('¿Eliminar esta foto?')) return
    try {
      await api.delete(`/empresas/${empresaId}/fotos/${fotoId}`)
      setMessage({ text: 'Foto eliminada', type: 'success' })
      setFotoModal(null)
      await cargarGaleria(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al eliminar la foto', type: 'error' })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1D6FAD, #00B4D8)' }}>
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Servicios</h1>
          <p className="text-gray-600">Publica los servicios que ofrece tu empresa, gestiona precios y disponibilidad.</p>
        </div>
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Formulario Publicar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-mercarof-cyan" /> Publicar nuevo servicio
          </h2>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            limiteAlcanzado
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {servicios.length} / {MAX_SERVICIOS} servicios
          </span>
        </div>

        {limiteAlcanzado && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            Has alcanzado el límite máximo de <b>{MAX_SERVICIOS}</b> servicios. Elimina uno antes de crear otro.
          </div>
        )}

        <form onSubmit={publicarServicio} className={`space-y-4 ${limiteAlcanzado ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del servicio *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
                placeholder="Ej: Reparación de fugas a domicilio"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan focus:border-transparent outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={3}
                placeholder="Describe el servicio, materiales incluidos, condiciones, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio</label>
              <input
                type="text"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                placeholder="Ej: $50 o A consultar"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Cómo se mostrará al cliente.</p>
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-mercarof-cyan focus:ring-mercarof-cyan"
                />
                <span className="text-sm font-medium text-gray-700">Servicio activo (visible)</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={publicando || limiteAlcanzado}
              className="text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-300/50 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #0F3D6E, #1D6FAD)' }}
            >
              <Send className="w-4 h-4" />
              {publicando ? 'Publicando...' : 'Publicar servicio'}
            </button>
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="btn-clear-red px-6 py-3 font-bold rounded-lg flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Lista de servicios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Tus servicios</h2>
          <span className="text-sm text-gray-500">{servicios.length} {servicios.length === 1 ? 'servicio' : 'servicios'}</span>
        </div>

        {servicios.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Aún no has publicado servicios</p>
            <p className="text-sm mt-1">Completa el formulario de arriba para publicar tu primer servicio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicios.map((s) => (
              <div key={s.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-2 gap-3">
                  <h3 className="font-bold text-lg text-gray-900 flex-1">{s.nombre}</h3>
                  {s.activo ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">Activo</span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">Inactivo</span>
                  )}
                </div>
                {s.descripcion && <p className="text-gray-600 text-sm mb-3">{s.descripcion}</p>}
                <div className="flex flex-wrap gap-3 text-sm mb-4">
                  {s.precio && (
                    <span className="font-semibold text-mercarof-navy">{s.precio}</span>
                  )}
                </div>

                {/* Imágenes del servicio (máx 4) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Imágenes ({s.imagenes?.length || 0}/{MAX_IMAGENES_POR_SERVICIO})
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(s.imagenes || []).map((img: any) => (
                      <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 group">
                        <img src={resolveImgUrl(img.url)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => eliminarImagenServicio(s.id, img.id)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(s.imagenes?.length || 0) < MAX_IMAGENES_POR_SERVICIO && (
                      <button
                        type="button"
                        onClick={() => triggerSubirImagenServicio(s.id)}
                        disabled={uploadingServId === s.id}
                        className="aspect-square rounded-md border-2 border-dashed border-gray-300 hover:border-mercarof-cyan hover:bg-blue-50/40 transition-colors flex items-center justify-center text-gray-400 hover:text-mercarof-cyan disabled:opacity-50"
                        title="Agregar imagen"
                      >
                        {uploadingServId === s.id
                          ? <div className="w-5 h-5 border-2 border-mercarof-cyan border-t-transparent rounded-full animate-spin" />
                          : <Plus className="w-6 h-6" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => editarServicio(s)}
                    className="flex-1 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => eliminarServicio(s.id)}
                    className="flex-1 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Galería de fotos (colapsable) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <button
          type="button"
          onClick={() => setShowGaleria((v) => !v)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-mercarof-cyan" />
            <span className="text-xl font-bold text-gray-900">Galería de fotos de la empresa</span>
            <span className="text-sm text-gray-500">({fotos.length})</span>
          </div>
          {showGaleria ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showGaleria && (
          <div className="p-6 pt-0 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">Sube fotos generales de tu empresa y trabajos para enriquecer tu perfil público.</p>

            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-mercarof-cyan transition-colors cursor-pointer mb-6"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="font-semibold text-gray-900">Click para subir o arrastra una foto</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG hasta 5MB</p>
              </div>
            ) : (
              <div className="flex items-start gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
                <img src={preview || ''} alt="Preview" className="w-28 h-28 object-cover rounded-lg" />
                <div className="flex-1">
                  <input
                    type="text"
                    value={fotoDescripcion}
                    onChange={(e) => setFotoDescripcion(e.target.value)}
                    placeholder="Descripción de la foto (opcional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={subirFoto}
                      disabled={uploading}
                      className="text-white text-sm font-semibold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #0F3D6E, #1D6FAD)' }}
                    >
                      <Upload className="w-3.5 h-3.5" /> {uploading ? 'Subiendo...' : 'Subir'}
                    </button>
                    <button
                      onClick={cancelarUpload}
                      className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {fotos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No has subido fotos todavía.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fotos.map((foto: any) => (
                  <div
                    key={foto.id}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setFotoModal(foto)}
                  >
                    <img src={resolveImgUrl(foto.url)} alt={foto.descripcion || 'Foto'} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Editar Servicio */}
      {modalOpen && editando && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-mercarof-cyan" /> Editar servicio
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={guardarEdicion} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del servicio *</label>
                <input
                  type="text"
                  value={editando.nombre || ''}
                  onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={editando.descripcion || ''}
                  onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Precio</label>
                  <input
                    type="text"
                    value={editando.precio || ''}
                    onChange={(e) => setEditando({ ...editando, precio: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!editando.activo}
                      onChange={(e) => setEditando({ ...editando, activo: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-mercarof-cyan focus:ring-mercarof-cyan"
                    />
                    <span className="text-sm font-medium text-gray-700">Servicio activo</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-300/50 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #0F3D6E, #1D6FAD)' }}
                >
                  <Wrench className="w-4 h-4" /> Guardar cambios
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Input oculto para subir imágenes de servicio */}
      <input
        ref={servicioFileInputRef}
        type="file"
        accept="image/*"
        onChange={onServicioFileChange}
        className="hidden"
      />

      {/* Modal foto detalle */}
      {fotoModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={() => setFotoModal(null)}>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setFotoModal(null)} className="absolute -top-10 right-0 text-white"><X className="w-8 h-8" /></button>
            <img src={resolveImgUrl(fotoModal.url)} alt="" className="w-full rounded-lg" />
            <div className="bg-white rounded-b-lg p-4 flex items-center justify-between gap-4">
              <p className="text-gray-700 text-sm flex-1">{fotoModal.descripcion || 'Sin descripción'}</p>
              <button
                onClick={() => eliminarFoto(fotoModal.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
