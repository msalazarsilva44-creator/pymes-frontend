import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Building2,
  CheckCircle,
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  MapPin,
  Tag,
  Lock,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Stepper, type StepDefinition } from '../components/Auth/Register/Stepper'
import { FormField } from '../components/Auth/Register/FormField'
import { FileUpload } from '../components/Auth/Register/FileUpload'

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

  // Asistente de pasos (solo empresa) — presentación, no altera la lógica de envío
  const prefersReducedMotion = useReducedMotion()
  const [empresaStep, setEmpresaStep] = useState(1)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const empresaSteps: StepDefinition[] = [
    { id: 1, label: 'Datos de la empresa' },
    { id: 2, label: 'Ubicación y contacto' },
    { id: 3, label: 'Documentación' }
  ]

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }))

  // Reutiliza las mismas reglas/mensajes existentes en handleSubmit
  const fieldError = (field: string): string => {
    switch (field) {
      case 'nombre':
        return nombre.trim() ? '' : 'Este campo es obligatorio'
      case 'rfc':
        return rfc && !/^[JGVEC]-\d{8}$/.test(rfc) ? 'Formato inválido. Ej: J-12345678' : ''
      case 'categoriaId':
        return categoriaId ? '' : 'Este campo es obligatorio'
      case 'oferta':
        return !ofreceProductos && !ofreceServicios
          ? 'Debes seleccionar al menos una opción: Productos o Servicios'
          : ''
      case 'ciudadId':
        return ciudadId ? '' : 'Este campo es obligatorio'
      case 'municipioId':
        return municipioId ? '' : 'Este campo es obligatorio'
      case 'direccion':
        return direccion.trim() ? '' : 'Este campo es obligatorio'
      case 'telefonoEmpresa':
        return telefonoEmpresa.length === 11 ? '' : 'Debe tener exactamente 11 dígitos'
      case 'email':
        if (!email.trim()) return 'Este campo es obligatorio'
        return /\S+@\S+\.\S+/.test(email) ? '' : 'Email inválido'
      case 'emailContacto':
        if (!emailContacto.trim()) return 'Este campo es obligatorio'
        return /\S+@\S+\.\S+/.test(emailContacto) ? '' : 'Email inválido'
      case 'password':
        return password ? '' : 'Este campo es obligatorio'
      case 'passwordConfirmation':
        if (!passwordConfirmation) return 'Este campo es obligatorio'
        return passwordConfirmation === password ? '' : 'Las contraseñas no coinciden'
      default:
        return ''
    }
  }

  const hasValue = (field: string): boolean => {
    switch (field) {
      case 'nombre':
        return nombre.trim().length > 0
      case 'rfc':
        return /^[JGVEC]-\d{8}$/.test(rfc)
      case 'categoriaId':
        return Boolean(categoriaId)
      case 'ciudadId':
        return Boolean(ciudadId)
      case 'municipioId':
        return Boolean(municipioId)
      case 'direccion':
        return direccion.trim().length > 0
      case 'telefonoEmpresa':
        return telefonoEmpresa.length === 11
      case 'email':
        return email.trim().length > 0
      case 'emailContacto':
        return emailContacto.trim().length > 0
      case 'password':
        return password.length > 0
      case 'passwordConfirmation':
        return passwordConfirmation.length > 0
      default:
        return false
    }
  }

  const showError = (field: string): string => (touched[field] ? fieldError(field) : '')
  const showValid = (field: string): boolean => touched[field] && !fieldError(field) && hasValue(field)

  const stepFields: Record<number, string[]> = {
    1: ['nombre', 'rfc', 'categoriaId', 'oferta'],
    2: ['ciudadId', 'municipioId', 'direccion', 'telefonoEmpresa', 'email', 'emailContacto', 'password', 'passwordConfirmation'],
    3: []
  }

  const validateStep = (step: number): boolean => {
    const fields = stepFields[step] || []
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }))
    return fields.every((f) => !fieldError(f))
  }

  const goNextStep = () => {
    if (validateStep(empresaStep)) {
      setError('')
      setEmpresaStep((s) => Math.min(s + 1, 3))
    }
  }

  const goPrevStep = () => setEmpresaStep((s) => Math.max(s - 1, 1))

  const handleEmpresaFormSubmit = (e: React.FormEvent) => {
    if (empresaStep < 3) {
      e.preventDefault()
      goNextStep()
      return
    }
    handleSubmit(e)
  }

  const stepTransition = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.25 } }

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

    if (tipo === 'empresa' && rfc && !/^[JGVEC]-\d{8}$/.test(rfc)) {
      setError('El RIF tiene formato inválido. Debe ser tipo J-12345678')
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
        const { access_token, user, empresa: emp } = res.data.data
        login(access_token, user, emp)
        setSuccess('Registro exitoso. Redirigiendo a selección de membresía...')
        setTimeout(() => { window.location.href = '/dashboard/empresa/solicitar-plan' }, 1500)
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

  // Asistente de Registro Empresa (rediseño en 3 pasos)
  if (tipo === 'empresa') {
    return (
      <div className="min-h-screen bg-[#F4F7FA] px-4 py-8 font-body sm:px-6">
        <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(14,58,95,0.10)] sm:p-8">
          <button
            type="button"
            onClick={() => setTipo(null)}
            className="mb-4 flex items-center gap-1.5 text-sm font-medium text-brand-deep/60 transition-colors hover:text-brand-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <h1 className="mb-6 text-center font-heading text-2xl font-semibold text-brand-navy">Registro Empresa</h1>

          <Stepper steps={empresaSteps} currentStep={empresaStep} />

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</div>
          )}

          <form onSubmit={handleEmpresaFormSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {empresaStep === 1 && (
                <motion.div key="step-1" {...stepTransition} className="space-y-4">
                  <FormField
                    id="emp-nombre"
                    label="Nombre de empresa / emprendimiento / organización o persona jurídica"
                    required
                    icon={Building2}
                    error={showError('nombre')}
                    valid={showValid('nombre')}
                  >
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      onBlur={() => markTouched('nombre')}
                    />
                  </FormField>

                  <FormField
                    id="emp-rfc"
                    label="RIF (ej: J-12345678)"
                    icon={FileText}
                    hint="Formato: J-12345678 (letra + guión + 8 dígitos, máx 10 caracteres)"
                    error={showError('rfc')}
                    valid={showValid('rfc')}
                  >
                    <input
                      value={rfc}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase()
                        if (/^[JGVEC]?[-]?\d{0,8}$/.test(val) || val === '') {
                          setRfc(val)
                        }
                      }}
                      onBlur={() => markTouched('rfc')}
                      maxLength={10}
                      placeholder="J-00000000"
                    />
                  </FormField>

                  <FormField
                    id="emp-categoria"
                    label="Categoría"
                    required
                    icon={Tag}
                    error={showError('categoriaId')}
                    valid={showValid('categoriaId')}
                  >
                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      onBlur={() => markTouched('categoriaId')}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField id="emp-descripcion" label="Descripción" icon={FileText}>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      rows={3}
                      className="resize-none"
                      placeholder="Breve descripción de tu empresa..."
                    />
                  </FormField>

                  <div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-brand-deep/80">
                      ¿Qué ofrece tu empresa? <span className="text-red-500">*</span>
                    </span>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 transition ${
                          ofreceProductos ? 'border-brand-cyan bg-brand-cyanlt/50' : 'border-brand-cyan/20 hover:border-brand-cyan/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={ofreceProductos}
                          onChange={(e) => {
                            setOfreceProductos(e.target.checked)
                            markTouched('oferta')
                          }}
                          className="h-4 w-4 rounded border-brand-cyan text-brand-cyan focus:ring-brand-cyan"
                        />
                        <span className="text-sm font-medium text-brand-deep">Productos</span>
                      </label>
                      <label
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 transition ${
                          ofreceServicios ? 'border-brand-cyan bg-brand-cyanlt/50' : 'border-brand-cyan/20 hover:border-brand-cyan/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={ofreceServicios}
                          onChange={(e) => {
                            setOfreceServicios(e.target.checked)
                            markTouched('oferta')
                          }}
                          className="h-4 w-4 rounded border-brand-cyan text-brand-cyan focus:ring-brand-cyan"
                        />
                        <span className="text-sm font-medium text-brand-deep">Servicios</span>
                      </label>
                    </div>
                    {showError('oferta') && (
                      <p className="mt-1 text-xs font-medium text-red-500">{showError('oferta')}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {empresaStep === 2 && (
                <motion.div key="step-2" {...stepTransition} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      id="emp-ciudad"
                      label="Ciudad"
                      required
                      icon={MapPin}
                      error={showError('ciudadId')}
                      valid={showValid('ciudadId')}
                    >
                      <select
                        value={ciudadId}
                        onChange={(e) => setCiudadId(e.target.value)}
                        onBlur={() => markTouched('ciudadId')}
                      >
                        <option value="">Ciudad</option>
                        {ciudades.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField
                      id="emp-municipio"
                      label="Municipio"
                      required
                      icon={MapPin}
                      error={showError('municipioId')}
                      valid={showValid('municipioId')}
                    >
                      <select
                        value={municipioId}
                        onChange={(e) => setMunicipioId(e.target.value)}
                        onBlur={() => markTouched('municipioId')}
                        disabled={!ciudadId}
                      >
                        <option value="">Municipio</option>
                        {municipios.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField
                    id="emp-direccion"
                    label="Dirección"
                    required
                    icon={MapPin}
                    error={showError('direccion')}
                    valid={showValid('direccion')}
                  >
                    <input
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      onBlur={() => markTouched('direccion')}
                    />
                  </FormField>

                  <FormField
                    id="emp-telefono"
                    label="Teléfono de la empresa"
                    required
                    icon={Phone}
                    hint={`${telefonoEmpresa.length}/11 dígitos`}
                    error={showError('telefonoEmpresa')}
                    valid={showValid('telefonoEmpresa')}
                  >
                    <input
                      value={telefonoEmpresa}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
                        setTelefonoEmpresa(digits)
                      }}
                      onBlur={() => markTouched('telefonoEmpresa')}
                      maxLength={11}
                      inputMode="numeric"
                      placeholder="04121234567"
                    />
                  </FormField>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      id="emp-email"
                      label="Email"
                      required
                      icon={Mail}
                      error={showError('email')}
                      valid={showValid('email')}
                    >
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => markTouched('email')}
                      />
                    </FormField>

                    <FormField
                      id="emp-email-contacto"
                      label="Email de contacto"
                      required
                      icon={Mail}
                      error={showError('emailContacto')}
                      valid={showValid('emailContacto')}
                    >
                      <input
                        type="email"
                        value={emailContacto}
                        onChange={(e) => setEmailContacto(e.target.value)}
                        onBlur={() => markTouched('emailContacto')}
                        placeholder="contacto@empresa.com"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      id="emp-password"
                      label="Contraseña"
                      required
                      icon={Lock}
                      error={showError('password')}
                      valid={showValid('password')}
                    >
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => markTouched('password')}
                      />
                    </FormField>

                    <FormField
                      id="emp-password-confirm"
                      label="Confirmar Contraseña"
                      required
                      icon={Lock}
                      error={showError('passwordConfirmation')}
                      valid={showValid('passwordConfirmation')}
                    >
                      <input
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        onBlur={() => markTouched('passwordConfirmation')}
                      />
                    </FormField>
                  </div>
                </motion.div>
              )}

              {empresaStep === 3 && (
                <motion.div key="step-3" {...stepTransition} className="space-y-4">
                  <div>
                    <span className="mb-2 flex items-center gap-1 text-sm font-semibold text-brand-deep/80">
                      RIF digital (PDF) <span className="text-red-500">*</span>
                    </span>
                    <FileUpload
                      file={rifFile}
                      onSelect={(file) => setRifFile(file)}
                      onRemove={() => setRifFile(null)}
                      onInvalid={() => setError('Solo se permiten archivos PDF')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {empresaStep > 1 ? (
                <button
                  type="button"
                  onClick={goPrevStep}
                  className="order-2 w-full rounded-lg border border-brand-cyan/30 px-5 py-2.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-cyanlt/40 sm:order-1 sm:w-auto"
                >
                  Atrás
                </button>
              ) : (
                <span className="hidden sm:block" />
              )}

              {empresaStep < 3 ? (
                <button
                  type="button"
                  onClick={goNextStep}
                  className="order-1 w-full rounded-lg bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy2 sm:order-2 sm:w-auto"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="order-1 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy2 disabled:opacity-50 sm:order-2 sm:w-auto"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-brand-deep/60">
            ¿Ya tienes cuenta? <Link to="/login" className="font-medium text-brand-cyan hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    )
  }

  // Formulario Persona Natural (sin cambios de lógica)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mercarof-navy to-mercarof-cyan px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <button
          type="button"
          onClick={() => setTipo(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-mercarof-navy transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-mercarof-navy mb-6 text-center">
          Registro Persona Natural
        </h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
            <input required value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula*</label>
            <input required maxLength={8} value={cedula} onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" placeholder="00000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
            <input required value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mercarof-cyan" />
          </div>
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
