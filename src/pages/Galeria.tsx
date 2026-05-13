import { useEffect, useState, useRef } from 'react'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { Upload, X, Trash2, Eye } from 'lucide-react'

export default function Galeria() {
  const [fotos, setFotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [descripcion, setDescripcion] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalFoto, setModalFoto] = useState<any>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [empresaId, setEmpresaId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const perfil = await api.get('/auth/me')
        const userData = perfil.data.data || perfil.data
        if (userData.empresa) {
          setEmpresaId(userData.empresa.id)
          await cargarGaleria(userData.empresa.id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const cargarGaleria = async (empId: number) => {
    try {
      const res = await api.get(`/empresas/${empId}/fotos`)
      setFotos(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'La imagen no debe superar 5MB', type: 'error' })
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'La imagen no debe superar 5MB', type: 'error' })
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const cancelarUpload = () => {
    setSelectedFile(null)
    setPreview(null)
    setDescripcion('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const subirFoto = async () => {
    if (!selectedFile || !empresaId) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('foto', selectedFile)
      fd.append('descripcion', descripcion)
      await api.post(`/empresas/${empresaId}/fotos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
      setModalOpen(false)
      await cargarGaleria(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al eliminar la foto', type: 'error' })
    }
  }

  const abrirModal = (foto: any) => {
    setModalFoto(foto)
    setModalOpen(true)
  }

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan"/></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📸 Galería de Fotos</h1>
        <p className="text-gray-600">Muestra tu trabajo y atrae más clientes con fotos profesionales</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Subir Nueva Foto</h2>
        
        {!selectedFile ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-mercarof-cyan transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault() }}
            onDragLeave={() => {}}
            onDrop={handleDrop}
          >
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg font-semibold text-gray-900 mb-2">Click para subir una foto</p>
            <p className="text-sm text-gray-600 mb-4">o arrastra y suelta aquí</p>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG hasta 5MB</p>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <img src={preview || ''} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (Opcional)</label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Describe esta foto..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={subirFoto} disabled={uploading} className="gradient-bg text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> {uploading ? 'Subiendo...' : 'Subir Foto'}
                </button>
                <button onClick={cancelarUpload} className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-mercarof-navy to-mercarof-cyan rounded-lg p-6 text-white mb-8">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">{fotos.length}</p>
            <p className="text-mercarof-cyan-light text-sm">Fotos subidas</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{fotos.reduce((a, b) => a + (b.vistas || 0), 0)}</p>
            <p className="text-mercarof-cyan-light text-sm">Vistas de galería</p>
          </div>
          <div>
            <p className="text-3xl font-bold">10</p>
            <p className="text-mercarof-cyan-light text-sm">Límite de fotos</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Tus Fotos</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🖼️</div>
              <p>No has subido fotos todavía</p>
              <p className="text-sm mt-2">Las fotos ayudan a los clientes a conocer tu trabajo</p>
            </div>
          ) : fotos.map((foto: any) => (
            <div key={foto.id} className="relative overflow-hidden rounded-lg aspect-square cursor-pointer group" onClick={() => abrirModal(foto)}>
              <img src={foto.url} alt={foto.descripcion || 'Foto'} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center">
                  <Eye className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Ver</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && modalFoto && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalOpen(false)} className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300"><X className="w-8 h-8" /></button>
            <img src={modalFoto.url} alt="" className="w-full rounded-lg" />
            <div className="bg-white rounded-b-lg p-4">
              <p className="text-gray-700">{modalFoto.descripcion || 'Sin descripción'}</p>
              <button onClick={() => eliminarFoto(modalFoto.id)} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Eliminar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
