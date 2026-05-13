import { useEffect, useState } from 'react'
import { api } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { Edit, Trash2, X, Package, Image as ImageIcon, PackagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Productos() {
  const [empresaId, setEmpresaId] = useState<number | null>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Formulario nuevo producto
  const [form, setForm] = useState({ nombre: '', precio: '', cantidad: 0, es_basico: true, descripcion: '' })
  const [imagenes, setImagenes] = useState<File[]>([])

  // Modal editar
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)
  const [editImages, setEditImages] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        const perfil = await api.get('/auth/me')
        const userData = perfil.data.data || perfil.data
        console.log('Usuario logueado:', userData)
        if (userData.empresa) {
          console.log('Empresa encontrada:', userData.empresa)
          setEmpresaId(userData.empresa.id)
          await cargarProductos(userData.empresa.id)
        } else {
          console.log('El usuario no tiene empresa asociada')
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const cargarProductos = async (empId: number) => {
    try {
      const res = await api.get(`/empresas/${empId}/productos`)
      setProductos(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmitNuevo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresaId) return
    if (imagenes.length > 5) { setMessage({ text: 'Máximo 5 imágenes', type: 'error' }); return }

    try {
      const res = await api.post(`/empresas/${empresaId}/productos`, {
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        cantidad: form.cantidad,
        es_basico: form.es_basico,
        descripcion: form.descripcion || null,
      })
      const nuevoId = res.data.data.id

      // Subir imágenes
      if (imagenes.length > 0) {
        for (let i = 0; i < Math.min(imagenes.length, 5); i++) {
          const fd = new FormData()
          fd.append('imagen', imagenes[i])
          await api.post(`/empresas/${empresaId}/productos/${nuevoId}/imagenes`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      }

      setMessage({ text: 'Producto agregado', type: 'success' })
      setForm({ nombre: '', precio: '', cantidad: 0, es_basico: true, descripcion: '' })
      setImagenes([])
      await cargarProductos(empresaId)
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Error al agregar', type: 'error' })
    }
  }

  const handleEliminar = async (id: number) => {
    if (!empresaId || !confirm('¿Eliminar este producto?')) return
    try {
      await api.delete(`/empresas/${empresaId}/productos/${id}`)
      setMessage({ text: 'Eliminado', type: 'success' })
      await cargarProductos(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al eliminar', type: 'error' })
    }
  }

  const abrirEditar = (p: any) => {
    setEditForm({ ...p })
    setEditImages(p.imagenes || [])
    setEditModal(true)
  }

  const handleGuardarEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresaId || !editForm) return
    try {
      await api.put(`/empresas/${empresaId}/productos/${editForm.id}`, {
        nombre: editForm.nombre,
        precio: editForm.precio,
        cantidad: editForm.cantidad,
        es_basico: editForm.es_basico,
        descripcion: editForm.descripcion || null,
      })
      setMessage({ text: 'Guardado', type: 'success' })
      setEditModal(false)
      await cargarProductos(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al guardar', type: 'error' })
    }
  }

  const handleSubirImagenEdit = async (file: File) => {
    if (!empresaId || !editForm) return
    const fd = new FormData()
    fd.append('imagen', file)
    try {
      await api.post(`/empresas/${empresaId}/productos/${editForm.id}/imagenes`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const res = await api.get(`/empresas/${empresaId}/productos`)
      const actualizado = res.data.data.find((p: any) => p.id === editForm.id)
      if (actualizado) {
        setEditForm(actualizado)
        setEditImages(actualizado.imagenes || [])
      }
      await cargarProductos(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al subir imagen', type: 'error' })
    }
  }

  const handleEliminarImagen = async (imagenId: number) => {
    if (!empresaId || !editForm) return
    try {
      await api.delete(`/empresas/${empresaId}/productos/${editForm.id}/imagenes/${imagenId}`)
      const res = await api.get(`/empresas/${empresaId}/productos`)
      const actualizado = res.data.data.find((p: any) => p.id === editForm.id)
      if (actualizado) {
        setEditForm(actualizado)
        setEditImages(actualizado.imagenes || [])
      }
      await cargarProductos(empresaId)
    } catch (err) {
      setMessage({ text: 'Error al eliminar imagen', type: 'error' })
    }
  }

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan"/></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Productos</h1>
          <p className="text-gray-600">Precio, descripción, stock, línea básica y hasta <strong>5 imágenes</strong> por producto.</p>
        </div>
        <Link
          to="/dashboard/empresa/productos/ingreso"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mercarof-cyan text-white rounded-xl text-sm font-semibold hover:bg-mercarof-cyan/90 transition-all shrink-0"
        >
          <PackagePlus className="w-4 h-4" />
          Ingreso de Mercancía
        </Link>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${message.type === 'error' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
          {message.text}
        </div>
      )}

      {/* Formulario nuevo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Agregar producto</h2>
        <form onSubmit={handleSubmitNuevo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" placeholder="Ej: Kit de herramientas" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio (USD) *</label>
              <input type="number" required min="0" step="0.01" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad en stock *</label>
              <input type="number" required min="0" step="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-6">
              <input type="checkbox" checked={form.es_basico} onChange={e => setForm({ ...form, es_basico: e.target.checked })} className="rounded border-gray-300 text-mercarof-cyan" />
              <span className="text-sm text-gray-700">Línea <strong>básica</strong></span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows="3" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" placeholder="Detalle del producto..." />
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">📷 Imágenes <span className="text-gray-400 font-normal">(opcional, hasta 5)</span></label>
            <input type="file" multiple accept="image/*" onChange={e => setImagenes(Array.from(e.target.files || []))} className="block w-full text-sm text-gray-600" />
            <p className="text-xs text-gray-500 mt-2">Seleccionadas: {imagenes.length}/5</p>
          </div>
          <button type="submit" className="bg-gradient-to-r from-mercarof-navy to-mercarof-cyan text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all">
            ➕ Agregar producto
          </button>
        </form>
      </div>

      {/* Lista productos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Tus productos</h2>
        {productos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No has agregado productos todavía</p>
          </div>
        ) : (
          <div className="space-y-4">
            {productos.map((p: any) => (
              <div key={p.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4">
                <div className="flex gap-1.5 shrink-0">
                  {p.imagenes && p.imagenes.length > 0 ? (
                    p.imagenes.slice(0, 3).map((img: any) => (
                      <img key={img.id} src={`http://localhost:8000${img.url}`} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                    ))
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
                  )}
                  {p.imagenes?.length > 3 && <span className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">+{p.imagenes.length - 3}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{p.nombre}</h3>
                    {p.es_basico && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold">Básico</span>}
                    <span className="text-xs text-gray-400">{p.imagenes?.length || 0}/5 fotos</span>
                  </div>
                  <p className="text-mercarof-navy font-bold">${parseFloat(p.precio).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Stock: <strong>{p.cantidad}</strong></p>
                  {p.descripcion && <p className="text-gray-600 text-sm mt-1">{p.descripcion}</p>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => abrirEditar(p)} className="text-sm bg-mercarof-navy text-white px-4 py-2 rounded-lg hover:bg-mercarof-navy-dark font-medium flex items-center gap-1"><Edit className="w-4 h-4" /> Editar</button>
                    <button onClick={() => handleEliminar(p.id)} className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 font-medium flex items-center gap-1"><Trash2 className="w-4 h-4" /> Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal editar */}
      {editModal && editForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">✏️ Editar producto</h2>
              <button onClick={() => setEditModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleGuardarEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input required value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
                  <input type="number" required min="0" step="0.01" value={editForm.precio} onChange={e => setEditForm({ ...editForm, precio: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                  <input type="number" required min="0" step="1" value={editForm.cantidad} onChange={e => setEditForm({ ...editForm, cantidad: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea value={editForm.descripcion || ''} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} rows="3" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.es_basico} onChange={e => setEditForm({ ...editForm, es_basico: e.target.checked })} className="rounded border-gray-300 text-mercarof-cyan" />
                <span className="text-sm text-gray-700">Línea básica</span>
              </label>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">📷 Fotos <span className="text-xs font-normal text-gray-500">({editImages.length}/5)</span></h3>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {editImages.map((img: any) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={`http://localhost:8000${img.url}`} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleEliminarImagen(img.id)} className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                </div>
                {editImages.length < 5 && (
                  <div>
                    <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleSubirImagenEdit(e.target.files[0])} className="text-sm" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-mercarof-navy to-mercarof-cyan text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all">💾 Guardar datos</button>
                <button type="button" onClick={() => setEditModal(false)} className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
