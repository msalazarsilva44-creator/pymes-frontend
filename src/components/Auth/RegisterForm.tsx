import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  User,
  Building2,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Upload,
  FileText,
  X,
  AlertCircle,
  BadgeCheck,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { AccountTypeCards, type AccountType } from './AccountTypeCards'
import { FormField } from './FormField'
import { PasswordStrength } from './PasswordStrength'

type FieldKey =
  | 'tipo'
  | 'nombre'
  | 'apellido'
  | 'cedula'
  | 'email'
  | 'password'
  | 'passwordConfirmation'
  | 'phone'
  | 'direccion'
  | 'categoriaId'
  | 'ciudadId'
  | 'municipioId'
  | 'telefonoEmpresa'
  | 'emailContacto'
  | 'descripcion'
  | 'rfc'
  | 'rifFile'
  | 'oferta'

interface Municipio {
  id: number
  nombre: string
}

interface Categoria {
  id: number
  nombre: string
}

interface Ciudad {
  id: number
  nombre: string
}

const initialErrors: Record<FieldKey, string> = {
  tipo: '',
  nombre: '',
  apellido: '',
  cedula: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  phone: '',
  direccion: '',
  categoriaId: '',
  ciudadId: '',
  municipioId: '',
  telefonoEmpresa: '',
  emailContacto: '',
  descripcion: '',
  rfc: '',
  rifFile: '',
  oferta: ''
}

const initialTouched: Record<FieldKey, boolean> = {
  tipo: false,
  nombre: false,
  apellido: false,
  cedula: false,
  email: false,
  password: false,
  passwordConfirmation: false,
  phone: false,
  direccion: false,
  categoriaId: false,
  ciudadId: false,
  municipioId: false,
  telefonoEmpresa: false,
  emailContacto: false,
  descripcion: false,
  rfc: false,
  rifFile: false,
  oferta: false
}

export function RegisterForm() {
  const prefersReducedMotion = useReducedMotion()
  const { login } = useAuth()

  const [tipo, setTipo] = useState<AccountType | null>(null)
  const [activeStep, setActiveStep] = useState<number>(1)

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

  const [categoriaId, setCategoriaId] = useState('')
  const [ciudadId, setCiudadId] = useState('')
  const [municipioId, setMunicipioId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [emailContacto, setEmailContacto] = useState('')
  const [telefonoEmpresa, setTelefonoEmpresa] = useState('')
  const [rfc, setRfc] = useState('')

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])

  const [errors, setErrors] = useState<Record<FieldKey, string>>(initialErrors)
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>(initialTouched)
  const [generalError, setGeneralError] = useState('')
  const [generalSuccess, setGeneralSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleTypeChange = (value: AccountType) => {
    setTipo(value)
    setActiveStep(1)
    setTouched((prev) => ({ ...prev, tipo: true }))
    setErrors((prev) => ({ ...prev, tipo: '' }))
    setGeneralError('')
    setGeneralSuccess('')
  }

  useEffect(() => {
    if (tipo === 'empresa') {
      api.get('/categorias').then((res) => setCategorias(res.data.data || res.data || []))
      api.get('/ciudades').then((res) => setCiudades(res.data.data || res.data || []))
    }
  }, [tipo])

  useEffect(() => {
    if (ciudadId) {
      setMunicipioId('')
      api.get(`/municipios/${ciudadId}`).then((res) => setMunicipios(res.data.data || res.data || []))
    } else {
      setMunicipios([])
    }
  }, [ciudadId])

  useEffect(() => {
    setActiveStep(1)
  }, [tipo])

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value)

  const validateField = (field: FieldKey): string => {
    switch (field) {
      case 'tipo':
        return tipo ? '' : 'Selecciona un tipo de cuenta'
      case 'nombre':
        return nombre.trim() ? '' : 'Este campo es obligatorio'
      case 'apellido':
        return tipo === 'natural' && !apellido.trim() ? 'Este campo es obligatorio' : ''
      case 'cedula':
        if (tipo === 'natural') {
          if (!cedula.trim()) return 'Este campo es obligatorio'
          if (cedula.trim().length !== 8) return 'Debe tener 8 dígitos'
        }
        return ''
      case 'email':
        if (!email.trim()) return 'Este campo es obligatorio'
        if (!validateEmail(email)) return 'Email inválido'
        return ''
      case 'password':
        if (!password) return 'La contraseña es obligatoria'
        if (password.length < 8) return 'Mínimo 8 caracteres'
        return ''
      case 'passwordConfirmation':
        if (!passwordConfirmation) return 'Confirma tu contraseña'
        if (passwordConfirmation !== password) return 'Las contraseñas no coinciden'
        return ''
      case 'phone':
        if (tipo === 'natural') {
          if (!phone.trim()) return 'Este campo es obligatorio'
          if (phone.length !== 11) return 'Debe tener 11 dígitos'
        }
        return ''
      case 'direccion':
        return direccion.trim() ? '' : 'Este campo es obligatorio'
      case 'categoriaId':
        return tipo === 'empresa' && !categoriaId ? 'Selecciona una categoría' : ''
      case 'ciudadId':
        return tipo === 'empresa' && !ciudadId ? 'Selecciona una ciudad' : ''
      case 'municipioId':
        return tipo === 'empresa' && !municipioId ? 'Selecciona un municipio' : ''
      case 'telefonoEmpresa':
        if (tipo === 'empresa') {
          if (!telefonoEmpresa) return 'El teléfono es obligatorio'
          if (telefonoEmpresa.length !== 11) return 'Debe tener 11 dígitos'
        }
        return ''
      case 'emailContacto':
        if (tipo === 'empresa') {
          if (!emailContacto.trim()) return 'Este campo es obligatorio'
          if (!validateEmail(emailContacto)) return 'Email inválido'
        }
        return ''
      case 'descripcion':
        return ''
      case 'rfc':
        if (tipo === 'empresa' && rfc && !/^[JGVEC]-\d{8}$/.test(rfc)) {
          return 'Formato inválido. Ej: J-12345678'
        }
        return ''
      case 'rifFile':
        return tipo === 'empresa' && !rifFile ? 'Debes adjuntar el RIF en PDF' : ''
      case 'oferta':
        return tipo === 'empresa' && !ofreceProductos && !ofreceServicios
          ? 'Selecciona al menos una opción'
          : ''
      default:
        return ''
    }
  }

  const handleBlur = (field: FieldKey) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const message = validateField(field)
    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  const validateStep = (step: number): boolean => {
    const fieldsToValidate: FieldKey[] = step === 1
      ? (tipo === 'natural'
          ? ['tipo', 'nombre', 'apellido', 'cedula', 'email', 'password', 'passwordConfirmation', 'phone', 'direccion']
          : ['tipo', 'nombre', 'email', 'password', 'passwordConfirmation', 'direccion'])
      : ['categoriaId', 'ciudadId', 'municipioId', 'telefonoEmpresa', 'emailContacto', 'rfc', 'rifFile', 'oferta']

    const newErrors: Record<FieldKey, string> = { ...errors }
    fieldsToValidate.forEach((field) => {
      const validation = validateField(field)
      newErrors[field] = validation
    })
    setErrors(newErrors)
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fieldsToValidate.map((field) => [field, true])) }))

    return fieldsToValidate.every((field) => !newErrors[field])
  }

  const handleNextStep = () => {
    if (validateStep(1)) {
      setActiveStep(2)
      setGeneralError('')
    }
  }

  const handlePrevStep = () => {
    setActiveStep(1)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError('')
    setGeneralSuccess('')

    if (!tipo) {
      setErrors((prev) => ({ ...prev, tipo: 'Selecciona un tipo de cuenta' }))
      setTouched((prev) => ({ ...prev, tipo: true }))
      setGeneralError('Completa los campos obligatorios')
      return
    }

    if (tipo === 'empresa' && activeStep === 1) {
      handleNextStep()
      return
    }

    const isValid = tipo === 'empresa' ? validateStep(2) && validateStep(1) : validateStep(1)
    if (!isValid) {
      setGeneralError('Revisa los campos marcados')
      return
    }

    if (password !== passwordConfirmation) {
      setErrors((prev) => ({ ...prev, passwordConfirmation: 'Las contraseñas no coinciden' }))
      setTouched((prev) => ({ ...prev, passwordConfirmation: true }))
      setGeneralError('Las contraseñas no coinciden')
      return
    }

    if (tipo === 'empresa' && !ofreceProductos && !ofreceServicios) {
      setErrors((prev) => ({ ...prev, oferta: 'Selecciona al menos una opción' }))
      setTouched((prev) => ({ ...prev, oferta: true }))
      setGeneralError('Selecciona al menos una opción')
      return
    }

    setLoading(true)

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
          direccion
        })
        setGeneralSuccess('Registro exitoso. Redirigiendo al login...')
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
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
        setGeneralSuccess('Registro exitoso. Redirigiendo a selección de membresía...')
        setTimeout(() => {
          window.location.href = '/dashboard/empresa/solicitar-plan'
        }, 1500)
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al registrarse'
      const fieldErrors = err.response?.data?.errors
      if (fieldErrors) {
        const flattened = Object.values(fieldErrors).flat().join('. ')
        setGeneralError(flattened)
      } else {
        setGeneralError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const companyStepIndicator = useMemo(() => {
    if (tipo !== 'empresa') return null
    return (
      <div className="flex items-center gap-3">
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                activeStep === step
                  ? 'border-brand-cyan bg-brand-cyan text-brand-deep'
                  : 'border-brand-cyan/20 text-brand-navy'
              }`}
            >
              {step}
            </span>
            {step === 1 && (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/50">
                {step === activeStep ? 'Cuenta' : 'Datos de cuenta'}
              </span>
            )}
            {step === 2 && (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/50">
                {step === activeStep ? 'Negocio' : 'Datos de negocio'}
              </span>
            )}
            {step === 1 && (
              <span className="mx-1 hidden h-px w-10 bg-brand-cyan/40 lg:block" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    )
  }, [activeStep, tipo])

  return (
    <div className="w-full max-w-xl">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-brand-navy">Crear cuenta</h1>
            <p className="mt-1 text-sm text-brand-deep/70">
              Completa tu información para comenzar a vender y conectar con clientes locales.
            </p>
          </div>
          <Link to="/login" className="text-sm font-semibold text-brand-cyan hover:text-brand-cyan/80">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
        {companyStepIndicator}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/50">
            Tipo de cuenta
          </p>
          <AccountTypeCards value={tipo} onChange={handleTypeChange} />
          {touched.tipo && errors.tipo && (
            <p className="flex items-center gap-1 text-xs font-medium text-red-500">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {errors.tipo}
            </p>
          )}
        </section>

        <AnimatePresence>
          {generalError && (
            <motion.div
              key="error"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700"
              role="alert"
            >
              {generalError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {generalSuccess && (
            <motion.div
              key="success"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700"
              role="status"
            >
              {generalSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid gap-4">
          <FormField
            id="nombre"
            label={tipo === 'empresa' ? 'Nombre comercial' : 'Nombre'}
            required
            icon={tipo === 'empresa' ? Building2 : User}
            error={touched.nombre ? errors.nombre : ''}
          >
            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              onBlur={() => handleBlur('nombre')}
            />
          </FormField>

          {tipo === 'natural' && (
            <FormField
              id="apellido"
              label="Apellido"
              required
              icon={User}
              error={touched.apellido ? errors.apellido : ''}
            >
              <input
                type="text"
                value={apellido}
                onChange={(event) => setApellido(event.target.value)}
                onBlur={() => handleBlur('apellido')}
              />
            </FormField>
          )}

          {tipo === 'natural' && (
            <FormField
              id="cedula"
              label="Cédula"
              required
              icon={BadgeCheck}
              error={touched.cedula ? errors.cedula : ''}
            >
              <input
                type="text"
                value={cedula}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '').slice(0, 8)
                  setCedula(digits)
                }}
                onBlur={() => handleBlur('cedula')}
                inputMode="numeric"
                maxLength={8}
                placeholder="00000000"
              />
            </FormField>
          )}

          <FormField
            id="email"
            label="Correo electrónico"
            required
            icon={Mail}
            error={touched.email ? errors.email : ''}
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => handleBlur('email')}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="password"
              label="Contraseña"
              required
              icon={Lock}
              error={touched.password ? errors.password : ''}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rounded-full p-1 text-brand-deep/50 transition hover:text-brand-navy"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            >
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => handleBlur('password')}
              />
            </FormField>

            <FormField
              id="passwordConfirmation"
              label="Confirmar contraseña"
              required
              icon={Lock}
              error={touched.passwordConfirmation ? errors.passwordConfirmation : ''}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="rounded-full p-1 text-brand-deep/50 transition hover:text-brand-navy"
                  aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            >
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                onBlur={() => handleBlur('passwordConfirmation')}
              />
            </FormField>
          </div>

          <PasswordStrength password={password} className="mt-1" />

          {tipo === 'natural' && (
            <FormField
              id="phone"
              label="Teléfono"
              required
              icon={Phone}
              error={touched.phone ? errors.phone : ''}
            >
              <input
                type="text"
                value={phone}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '').slice(0, 11)
                  setPhone(digits)
                }}
                onBlur={() => handleBlur('phone')}
                inputMode="numeric"
                maxLength={11}
                placeholder="04121234567"
              />
            </FormField>
          )}

          <FormField
            id="direccion"
            label="Dirección"
            required
            icon={MapPin}
            error={touched.direccion ? errors.direccion : ''}
          >
            <input
              type="text"
              value={direccion}
              onChange={(event) => setDireccion(event.target.value)}
              onBlur={() => handleBlur('direccion')}
            />
          </FormField>
        </section>

        {tipo === 'empresa' && activeStep === 2 && (
          <section className="grid gap-4">
            <FormField
              id="categoriaId"
              label="Categoría"
              required
              icon={Building2}
              error={touched.categoriaId ? errors.categoriaId : ''}
            >
              <select
                value={categoriaId}
                onChange={(event) => setCategoriaId(event.target.value)}
                onBlur={() => handleBlur('categoriaId')}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="ciudadId"
                label="Ciudad"
                required
                icon={MapPin}
                error={touched.ciudadId ? errors.ciudadId : ''}
              >
                <select
                  value={ciudadId}
                  onChange={(event) => setCiudadId(event.target.value)}
                  onBlur={() => handleBlur('ciudadId')}
                >
                  <option value="">Seleccionar ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id} value={ciudad.id}>
                      {ciudad.nombre}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                id="municipioId"
                label="Municipio"
                required
                icon={MapPin}
                error={touched.municipioId ? errors.municipioId : ''}
              >
                <select
                  value={municipioId}
                  onChange={(event) => setMunicipioId(event.target.value)}
                  onBlur={() => handleBlur('municipioId')}
                  disabled={!ciudadId}
                >
                  <option value="">Seleccionar municipio</option>
                  {municipios.map((municipio) => (
                    <option key={municipio.id} value={municipio.id}>
                      {municipio.nombre}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              id="telefonoEmpresa"
              label="Teléfono de la empresa"
              required
              icon={Phone}
              error={touched.telefonoEmpresa ? errors.telefonoEmpresa : ''}
            >
              <input
                type="text"
                value={telefonoEmpresa}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '').slice(0, 11)
                  setTelefonoEmpresa(digits)
                }}
                onBlur={() => handleBlur('telefonoEmpresa')}
                inputMode="numeric"
                maxLength={11}
                placeholder="04121234567"
              />
            </FormField>

            <FormField
              id="emailContacto"
              label="Email de contacto"
              required
              icon={Mail}
              error={touched.emailContacto ? errors.emailContacto : ''}
            >
              <input
                type="email"
                value={emailContacto}
                onChange={(event) => setEmailContacto(event.target.value)}
                onBlur={() => handleBlur('emailContacto')}
              />
            </FormField>

            <FormField
              id="rfc"
              label="RIF (ej: J-12345678)"
              icon={FileText}
              error={touched.rfc ? errors.rfc : ''}
              description="Letra + guión + 8 dígitos"
            >
              <input
                type="text"
                value={rfc}
                onChange={(event) => {
                  const val = event.target.value.toUpperCase()
                  if (/^[JGVEC]?-?\d{0,8}$/.test(val) || val === '') {
                    setRfc(val.replace(/(.*)/, val => val.toUpperCase()))
                  }
                }}
                onBlur={() => handleBlur('rfc')}
                maxLength={10}
                placeholder="J-00000000"
              />
            </FormField>

            <FormField id="descripcion" label="Descripción" icon={FileText}>
              <textarea
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                onBlur={() => handleBlur('descripcion')}
                rows={3}
                className="resize-none"
              />
            </FormField>

            <div className="space-y-2">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/60">
                <span>RIF digital (PDF)</span>
                <span className="text-red-500">*</span>
              </p>
              {!rifFile ? (
                <label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                  touched.rifFile && errors.rifFile
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-brand-cyan/40 bg-brand-cyanlt/40 hover:border-brand-cyan'
                }`}>
                  <Upload className="h-6 w-6 text-brand-deep/40" aria-hidden="true" />
                  <span className="mt-3 text-sm font-semibold text-brand-navy">Subir documento</span>
                  <span className="text-xs text-brand-deep/50">Arrastra o haz clic para cargar (PDF)</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file && file.type === 'application/pdf') {
                        setRifFile(file)
                        setErrors((prev) => ({ ...prev, rifFile: '' }))
                      } else if (file) {
                        setErrors((prev) => ({ ...prev, rifFile: 'Solo se permiten archivos PDF' }))
                        setTouched((prev) => ({ ...prev, rifFile: true }))
                      }
                    }}
                    onBlur={() => handleBlur('rifFile')}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-cyan/40 bg-brand-cyanlt/30 px-4 py-3">
                  <FileText className="h-5 w-5 text-brand-cyan" aria-hidden="true" />
                  <span className="flex-1 truncate text-sm font-medium text-brand-deep">{rifFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRifFile(null)
                      setTouched((prev) => ({ ...prev, rifFile: true }))
                      setErrors((prev) => ({ ...prev, rifFile: 'Debes adjuntar el RIF en PDF' }))
                    }}
                    className="rounded-full p-1 text-brand-deep/40 transition hover:text-red-500"
                    aria-label="Quitar archivo adjunto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {touched.rifFile && errors.rifFile && (
                <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.rifFile}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/60">
                <span>¿Qué ofrece tu empresa?</span>
                <span className="text-red-500">*</span>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    ofreceProductos ? 'border-brand-cyan bg-brand-cyanlt/50 shadow-sm' : 'border-brand-cyan/20 hover:border-brand-cyan/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={ofreceProductos}
                    onChange={(event) => {
                      const checked = event.target.checked
                      setOfreceProductos(checked)
                      setTouched((prev) => ({ ...prev, oferta: true }))
                      setErrors((prev) => ({ ...prev, oferta: '' }))
                    }}
                    className="h-4 w-4 rounded border-brand-cyan text-brand-cyan focus:ring-brand-cyan/40"
                  />
                  <span className="text-sm font-semibold text-brand-deep">Productos</span>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    ofreceServicios ? 'border-brand-cyan bg-brand-cyanlt/50 shadow-sm' : 'border-brand-cyan/20 hover:border-brand-cyan/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={ofreceServicios}
                    onChange={(event) => {
                      const checked = event.target.checked
                      setOfreceServicios(checked)
                      setTouched((prev) => ({ ...prev, oferta: true }))
                      setErrors((prev) => ({ ...prev, oferta: '' }))
                    }}
                    className="h-4 w-4 rounded border-brand-cyan text-brand-cyan focus:ring-brand-cyan/40"
                  />
                  <span className="text-sm font-semibold text-brand-deep">Servicios</span>
                </label>
              </div>
              {touched.oferta && errors.oferta && (
                <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.oferta}
                </p>
              )}
            </div>
          </section>
        )}

        {tipo === 'empresa' && activeStep === 1 && (
          <div className="flex items-center justify-between rounded-2xl border border-brand-cyan/30 bg-brand-cyanlt/20 p-4">
            <div>
              <p className="font-heading text-sm font-semibold text-brand-navy">Datos del negocio</p>
              <p className="text-xs text-brand-deep/60">En el siguiente paso completaremos la información de tu empresa.</p>
            </div>
            <button
              type="button"
              onClick={handleNextStep}
              className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
            >
              Continuar
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            {loading ? 'Creando cuenta...' : tipo === 'empresa' && activeStep === 1 ? 'Guardar y continuar' : 'Crear cuenta'}
          </button>
          <p className="text-center text-xs text-brand-deep/60">
            Al registrarte aceptas nuestros <Link to="/terminos" className="text-brand-cyan hover:text-brand-cyan/80">Términos y condiciones</Link> y la{' '}
            <Link to="/privacidad" className="text-brand-cyan hover:text-brand-cyan/80">Política de privacidad</Link>.
          </p>
          {tipo === 'empresa' && activeStep === 2 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="text-sm font-semibold text-brand-cyan hover:text-brand-cyan/70"
            >
              Volver al paso anterior
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
