import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Building2, CheckCircle, ArrowLeft, Upload, FileText, X } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { login } = useAuth()
  const [tipo, setTipo] = useState<'natural' | 'empresa' | null>(null)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [cedula, setCedula] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [phone, setPhone] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ofreceProductos, setOfreceProductos] = useState(false)
  const [ofreceServicios, setOfreceServicios] = useState(false)
  const [rifFile, setRifFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Campos adicionales para empresa
  const [categoriaId, setCategoriaId] = useState('')
  const [ciudadId, setCiudadId] = useState('')
  const [municipioId, setMunicipioId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [emailContacto, setEmailContacto] = useState('')
  const [telefonoEmpresa, setTelefonoEmpresa] = useState('')
  const [rfc, setRfc] = useState('')

  // Listas para selects
  const [categorias, setCategorias] = useState<any[]>([])
  const [ciudades, setCiudades] = useState<any[]>([])
  const [municipios, setMunicipios] = useState<any[]>([])

  // Cargar categorías y ciudades cuando se selecciona tipo empresa
  useEffect(() => {
    if (tipo === 'empresa') {
      api.get('/categorias').then(res => setCategorias(res.data.data || res.data || []))
      api.get('/ciudades').then(res => setCiudades(res.data.data || res.data || []))
    }
  }, [tipo])

  // Cargar municipios cuando cambia la ciudad
  useEffect(() => {
    if (ciudadId) {
      setMunicipioId('')
      api.get(`/municipios/${ciudadId}`).then(res => setMunicipios(res.data.data || res.data || []))
    } else {
      setMunicipios([])
    }
  }, [ciudadId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (tipo === 'empresa' && !ofreceProductos && !ofreceServicios) {
      setError('Debes seleccionar al menos una opción: Productos o Servicios')
      setLoading(false)
      return
    }

    if (tipo === 'empresa' && !rifFile) {
      setError('Debes subir el RIF digital de tu empresa (PDF)')
      setLoading(false)
      return
    }

    if (tipo === 'empresa' && rfc && !/^[JGVEC]-\d{8}-\d$/.test(rfc)) {
      setError('El RIF tiene formato inválido. Debe ser tipo J-12345678-9')
      setLoading(false)
      return
    }

    if (tipo === 'empresa' && telefonoEmpresa.length !== 11) {
      setError('El teléfono de la empresa debe tener exactamente 11 dígitos')
      setLoading(false)
      return
    }

    if (tipo === 'natural' && phone.length !== 11) {
      setError('El teléfono debe tener exactamente 11 dígitos')
      setLoading(false)
      return
    }

    if (tipo === 'empresa' && (!categoriaId || !ciudadId || !municipioId)) {
      setError('Categoría, ciudad y municipio son obligatorios')
      setLoading(false)
      return
    }

    try {
      if (tipo === 'natural') {
        await api.post('/auth/register/cliente', {
          name: nombre,
          apellido,
          cedula,
          email,
          password,
          password_confirmation: passwordConfirmation,
          phone,
          direccion,
        })
        setSuccess('Registro exitoso. Redirigiendo al login...')
        setTimeout(() => { window.location.href = '/login' }, 2000)
      } else {
        const formData = new FormData()
        formData.append('name', nombre)
        formData.append('email', email)
        formData.append('password', password)
        formData.append('password_confirmation', passwordConfirmation)
        formData.append('phone', phone || telefonoEmpresa)
        formData.append('nombre_comercial', nombre)
        formData.append('categoria_id', categoriaId)
        formData.append('ciudad_id', ciudadId)
        formData.append('municipio_id', municipioId)
        formData.append('telefono', telefonoEmpresa || phone)
        formData.append('email_contacto', emailContacto || email)
        formData.append('direccion', direccion)
        formData.append('ofrece_productos', ofreceProductos ? '1' : '0')
        formData.append('ofrece_servicios', ofreceServicios ? '1' : '0')
        if (descripcion) formData.append('descripcion', descripcion)
        if (rfc) formData.append('rfc', rfc)
        if (rifFile) formData.append('documento_rif', rifFile)

        const res = await api.post('/auth/register/empresa', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const { access_token, user } = res.data.data
        login(access_token, user)
        setSuccess('Registro exitoso. Redirigiendo al panel de empresa...')
        setTimeout(() => { window.location.href = '/dashboard/empresa' }, 1500)
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al registrarse'
      const errors = err.response?.data?.errors
      if (errors) {
        setError(Object.values(errors).flat().join('. '))
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de selección de tipo
  if (tipo === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mercarof-navy to-mercarof-cyan px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
            <p className="text-white/70 text-sm">Selecciona el tipo de cuenta que deseas crear</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Card Persona Natural */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl p-7 flex flex-col border-2 border-transparent hover:border-purple-400 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-5 group-hover:bg-purple-200 transition-colors">
                <User className="w-7 h-7 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Persona Natural</h2>
              <p className="text-sm text-gray-500 mb-5">Independiente, freelancer o comprador</p>
              <ul className="space-y-3 mb-7 flex-1">
                <li className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Busca productos y servicios</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Adquiere productos y servicios verificados</span>
                </li>
              </ul>
              <button
                onClick={() => setTipo('natural')}
                className="w-full py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
              >
                Continuar
              </button>
            </div>

            {/* Card Empresa */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl p-7 flex flex-col border-2 border-transparent hover:border-emerald-400 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-5 group-hover:bg-emerald-200 transition-colors">
                <Building2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Empresa</h2>
              <p className="text-sm text-gray-500 mb-5">Persona jurídica, organización o negocio</p>
              <ul className="space-y-3 mb-7 flex-1">
                <li className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Publica tu producto o servicio</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Emprende rápido</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Llega a más clientes potenciales</span>
                </li>
              </ul>
              <button
                onClick={() => setTipo('empresa')}
                className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-white/70">
            ¿Ya tienes cuenta? <Link to="/login" className="text-white font-medium hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    )
  }

  // Formularios existentes
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mercarof-navy to-mercarof-cyan px-4 py-8">
      <div className={`bg-white rounded-2xl shadow-xl p-8 w-full ${tipo === 'empresa' ? 'max-w-lg' : 'max-w-md'}`}>
        <button
          type="button"
          onClick={() => setTipo(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-mercarof-navy transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-mercarof-navy mb-6 text-center">
          {tipo === 'natural' ? 'Registro Persona Natural' : 'Registro Empresa'}
        </h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tipo === 'empresa' ? 'Nombre de empresa / emprendimiento / organización o persona jurídica *' : 'Nombre *'}
            </label>
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
          </div>
          {tipo === 'natural' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input required value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
            </div>
          )}
          {tipo === 'natural' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula*</label>
              <input required maxLength={8} value={cedula} onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" placeholder="00000000" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
          </div>
          {tipo === 'empresa' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RIF (ej: J-12345678-9)</label>
                <input
                  value={rfc}
                  onChange={(e) => {
                    // Allow: optional letter prefix + digits + optional dash + check digit
                    const val = e.target.value.toUpperCase()
                    // Only allow J/G/V/E/C, digits and dashes
                    if (/^[JGVEC]?[-]?\d{0,8}[-]?\d?$/.test(val) || val === '') {
                      setRfc(val)
                    }
                  }}
                  maxLength={12}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mercarof-cyan ${
                    rfc && !/^[JGVEC]-\d{8}-\d$/.test(rfc) ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="J-00000000-0"
                />
                <p className="text-xs mt-1 text-gray-400">Formato: J-12345678-9 (letra + 8 dígitos + dígito verificador)</p>
                {rfc && !/^[JGVEC]-\d{8}-\d$/.test(rfc) && (
                  <p className="text-xs mt-0.5 text-red-500">Formato inválido. Ej: J-12345678-9</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan bg-white">
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                  <select required value={ciudadId} onChange={(e) => setCiudadId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan bg-white">
                    <option value="">Ciudad</option>
                    {ciudades.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipio *</label>
                  <select required value={municipioId} onChange={(e) => setMunicipioId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan bg-white" disabled={!ciudadId}>
                    <option value="">Municipio</option>
                    {municipios.map((m: any) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de la empresa *</label>
                <input
                  required
                  value={telefonoEmpresa}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
                    setTelefonoEmpresa(digits)
                  }}
                  maxLength={11}
                  inputMode="numeric"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mercarof-cyan ${
                    telefonoEmpresa && telefonoEmpresa.length < 11 ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="04121234567"
                />
                <p className="text-xs mt-1 text-gray-400">{telefonoEmpresa.length}/11 dígitos</p>
                {telefonoEmpresa && telefonoEmpresa.length < 11 && (
                  <p className="text-xs mt-0.5 text-red-500">Debe tener exactamente 11 dígitos</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de contacto *</label>
                <input type="email" required value={emailContacto} onChange={(e) => setEmailContacto(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" placeholder="contacto@empresa.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan resize-none" placeholder="Breve descripción de tu empresa..." />
              </div>
            </>
          )}
          {tipo === 'natural' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                required
                value={phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
                  setPhone(digits)
                }}
                maxLength={11}
                inputMode="numeric"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mercarof-cyan ${
                  phone && phone.length < 11 ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="04121234567"
              />
              <p className="text-xs mt-1 text-gray-400">{phone.length}/11 dígitos</p>
              {phone && phone.length < 11 && (
                <p className="text-xs mt-0.5 text-red-500">Debe tener exactamente 11 dígitos</p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
            <input required value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
          </div>
          {tipo === 'empresa' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RIF digital (PDF) *</label>
              {!rifFile ? (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-mercarof-cyan hover:bg-gray-50 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">Haz clic para subir el RIF</span>
                  <span className="text-xs text-gray-400 mt-0.5">Solo archivos PDF</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file && file.type === 'application/pdf') {
                        setRifFile(file)
                      } else if (file) {
                        setError('Solo se permiten archivos PDF')
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <FileText className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-sm text-gray-700 truncate flex-1">{rifFile.name}</span>
                  <button type="button" onClick={() => setRifFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
          {tipo === 'empresa' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué ofrece tu empresa? *</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ofreceProductos}
                    onChange={(e) => setOfreceProductos(e.target.checked)}
                    className="w-4 h-4 text-mercarof-navy border-gray-300 rounded focus:ring-mercarof-cyan"
                  />
                  <span className="text-sm text-gray-700">Productos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ofreceServicios}
                    onChange={(e) => setOfreceServicios(e.target.checked)}
                    className="w-4 h-4 text-mercarof-navy border-gray-300 rounded focus:ring-mercarof-cyan"
                  />
                  <span className="text-sm text-gray-700">Servicios</span>
                </label>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
            <input type="password" required value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-mercarof-navy text-white font-semibold rounded-lg hover:bg-mercarof-navy-dark transition-all disabled:opacity-50">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-mercarof-cyan font-medium hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
