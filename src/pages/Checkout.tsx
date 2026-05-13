import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart, type CartEmpresa } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

// --- SVG ICONS ---
const Icons = {
  Cart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  CreditCard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="22" height="16" x="1" y="4" rx="2"/><line x1="1" x2="23" y1="10" y2="10"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12"/></svg>,
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  ArrowLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  Upload: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
}

const STEPS = [
  { id: 1, label: 'Carrito', icon: Icons.Cart },
  { id: 2, label: 'Entrega', icon: Icons.User },
  { id: 3, label: 'Pago', icon: Icons.CreditCard },
]

type MetodoPagoTipo = 'paypal' | 'binance' | 'transferencia' | 'pago_movil'

interface Ciudad { id: number; nombre: string }
interface Municipio { id: number; nombre: string }

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, loading: cartLoading, fetchCart } = useCart()

  const [step, setStep] = useState(1)
  const [stepErrors, setStepErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderResult, setOrderResult] = useState<{ numero: string; id: number } | null>(null)

  // Perfil precargado
  const [perfilLoaded, setPerfilLoaded] = useState(false)

  // Entrega
  const [tipoEntrega, setTipoEntrega] = useState<'digital' | 'fisica'>('fisica')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudadId, setCiudadId] = useState<string>('')
  const [ciudadNombre, setCiudadNombre] = useState('')
  const [municipioId, setMunicipioId] = useState<string>('')
  const [municipioNombre, setMunicipioNombre] = useState('')
  const [referenciaEntrega, setReferenciaEntrega] = useState('')
  const [notasCliente, setNotasCliente] = useState('')
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])

  // Pago
  const [metodoPagoTipo, setMetodoPagoTipo] = useState<MetodoPagoTipo | ''>('')
  const [referenciaPago, setReferenciaPago] = useState('')
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null)

  // Reveal animation
  const mainRef = useRef<HTMLDivElement>(null)
  useEffect(() => { mainRef.current?.classList.add('animate-in') }, [])

  // Fetch cart + profile
  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchCart()
    ;(async () => {
      try {
        const [perfilRes, ciudadesRes] = await Promise.all([
          api.get('/cliente/perfil'),
          api.get('/ciudades'),
        ])
        const p = perfilRes.data.data
        setTelefono(p.telefono || '')
        setDireccion(p.direccion || '')
        setCiudadId(p.ciudad_id ? String(p.ciudad_id) : '')
        setCiudadNombre(p.ciudad || '')
        setMunicipioId(p.municipio_id ? String(p.municipio_id) : '')
        setMunicipioNombre(p.municipio || '')
        setReferenciaEntrega(p.referencia_direccion || '')
        setCiudades(ciudadesRes.data.data || ciudadesRes.data || [])
      } catch {
        /* ignore */
      } finally {
        setPerfilLoaded(true)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cargar municipios cuando cambia ciudad
  useEffect(() => {
    if (!ciudadId) { setMunicipios([]); return }
    api.get(`/municipios/${ciudadId}`).then(r => {
      setMunicipios(r.data.data || r.data || [])
    }).catch(() => setMunicipios([]))
    const c = ciudades.find(c => String(c.id) === String(ciudadId))
    if (c) setCiudadNombre(c.nombre)
  }, [ciudadId, ciudades])

  useEffect(() => {
    const m = municipios.find(m => String(m.id) === String(municipioId))
    if (m) setMunicipioNombre(m.nombre)
    else if (!municipioId) setMunicipioNombre('')
  }, [municipioId, municipios])

  // Solo una empresa (carrito restringido)
  const empresaGroup: CartEmpresa | null = cart?.por_empresa?.[0] ?? null
  const subtotal = Number(cart?.total ?? 0)
  const total = subtotal

  // Al primer método disponible
  useEffect(() => {
    if (empresaGroup && !metodoPagoTipo && empresaGroup.metodos_pago.length > 0) {
      setMetodoPagoTipo(empresaGroup.metodos_pago[0].tipo as MetodoPagoTipo)
    }
  }, [empresaGroup, metodoPagoTipo])

  const handleFile = (f: File | null) => {
    if (!f) { setComprobanteFile(null); setComprobantePreview(null); return }
    setComprobanteFile(f)
    const reader = new FileReader()
    reader.onload = () => setComprobantePreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  const validateStep = (s: number): boolean => {
    const errs: string[] = []
    if (s === 1) {
      if (!empresaGroup || empresaGroup.items.length === 0) errs.push('Tu carrito está vacío')
    }
    if (s === 2) {
      if (!telefono.trim()) errs.push('Teléfono de contacto requerido')
      if (tipoEntrega === 'fisica') {
        if (!direccion.trim()) errs.push('Dirección de entrega requerida')
        if (!ciudadId) errs.push('Ciudad requerida')
      }
    }
    if (s === 3) {
      if (!metodoPagoTipo) errs.push('Selecciona un método de pago')
      if (!comprobanteFile) errs.push('Debes subir el comprobante de pago')
    }
    setStepErrors(errs)
    return errs.length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStepErrors([])
      setStep(s => Math.min(3, s + 1))
    }
  }
  const prevStep = () => { setStepErrors([]); setStep(s => Math.max(1, s - 1)) }

  const handleConfirm = async () => {
    if (!validateStep(3)) return
    if (!empresaGroup) return
    setIsProcessing(true)
    try {
      const fd = new FormData()
      fd.append('empresa_id', String(empresaGroup.empresa_id))
      fd.append('metodo_pago', metodoPagoTipo)
      if (referenciaPago) fd.append('referencia_pago', referenciaPago)
      if (comprobanteFile) fd.append('comprobante_pago', comprobanteFile)
      if (notasCliente) fd.append('notas_cliente', notasCliente)
      fd.append('tipo_entrega', tipoEntrega)
      fd.append('telefono_contacto', telefono)
      if (tipoEntrega === 'fisica') {
        fd.append('direccion_entrega', direccion)
        fd.append('ciudad_entrega', ciudadNombre)
        if (municipioNombre) fd.append('municipio_entrega', municipioNombre)
        if (referenciaEntrega) fd.append('referencia_entrega', referenciaEntrega)
      }

      const res = await api.post('/ordenes', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const orden = res.data.data
      setOrderResult({ numero: orden.numero_orden, id: orden.id })
      await fetchCart()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al crear la orden'
      const extra = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' • ')
        : ''
      setStepErrors([msg, extra].filter(Boolean))
    } finally {
      setIsProcessing(false)
    }
  }

  // --- ORDER COMPLETE ---
  if (orderResult) {
    return (
      <div className="min-h-screen bg-[#F0F6FC] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center animate-in" style={{ opacity: 0, transform: 'translateY(20px)', animationDelay: '100ms' }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0F3D6E, #00B4D8)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0F3D6E] mb-2">¡Pedido confirmado!</h2>
          <p className="text-[#6B7A90] mb-2">Tu orden <span className="font-bold text-[#1D6FAD]">{orderResult.numero}</span> fue registrada.</p>
          <p className="text-sm text-[#6B7A90] mb-8">La empresa revisará tu pago y confirmará la orden muy pronto.</p>
          <div className="bg-[#F0F6FC] rounded-xl p-4 mb-8 text-left">
            <div className="flex justify-between text-sm mb-1"><span className="text-[#6B7A90]">Total pagado</span><span className="font-bold text-[#0F3D6E]">${total.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#6B7A90]">Método</span><span className="font-semibold text-[#1D6FAD] capitalize">{metodoPagoTipo.replace('_', ' ')}</span></div>
          </div>
          <div className="flex gap-3">
            <Link to="/marketplace" className="flex-1 py-3 rounded-xl border-2 border-[#0F3D6E] text-[#0F3D6E] font-bold text-sm text-center hover:bg-[#0F3D6E]/5 transition-colors">
              Seguir comprando
            </Link>
            <Link to="/mis-ordenes" className="flex-1 py-3 rounded-xl font-bold text-sm text-white text-center" style={{ background: 'linear-gradient(135deg, #0F3D6E 0%, #1D6FAD 55%, #00B4D8 100%)' }}>
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cartLoading && !cart) {
    return (
      <div className="min-h-screen bg-[#F0F6FC] flex items-center justify-center">
        <div className="text-[#6B7A90] font-semibold">Cargando carrito...</div>
      </div>
    )
  }

  if (!empresaGroup) {
    return (
      <div className="min-h-screen bg-[#F0F6FC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <p className="text-4xl mb-4">🛒</p>
          <h2 className="text-xl font-bold text-[#0F3D6E] mb-2">Tu carrito está vacío</h2>
          <p className="text-sm text-[#6B7A90] mb-6">Agrega productos o servicios antes de continuar al checkout.</p>
          <Link to="/marketplace" className="inline-block px-6 py-3 rounded-xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #0F3D6E 0%, #1D6FAD 55%, #00B4D8 100%)' }}>
            Explorar marketplace
          </Link>
        </div>
      </div>
    )
  }

  const metodoSel = empresaGroup.metodos_pago.find(m => m.tipo === metodoPagoTipo)

  return (
    <div className="min-h-screen bg-[#F0F6FC] font-sans text-[#1E2A3A]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/carrito" className="flex items-center gap-2 text-[#6B7A90] hover:text-[#0F3D6E] transition-colors text-sm font-semibold">
              <Icons.ArrowLeft />
              <span className="hidden sm:inline">Volver</span>
            </Link>
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #0F3D6E, #1D6FAD, #00B4D8)' }}>M</div>
              <span className="text-lg font-bold text-[#0F3D6E] hidden sm:inline">MERCAROF</span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                {idx > 0 && <div className={`w-6 sm:w-10 h-0.5 rounded ${step > idx ? 'bg-[#00B4D8]' : 'bg-gray-200'} transition-colors`} />}
                <button
                  onClick={() => s.id < step && setStep(s.id)}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    step === s.id ? 'bg-[#0F3D6E] text-white shadow-lg'
                    : step > s.id ? 'bg-[#00B4D8]/15 text-[#00B4D8] cursor-pointer'
                    : 'bg-gray-100 text-gray-400'
                  }`}
                  disabled={s.id > step}
                >
                  {step > s.id ? <Icons.Check /> : <s.icon />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="text-xs font-bold text-[#6B7A90] uppercase tracking-wider hidden md:block">
            Paso {step} de 3
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div ref={mainRef} className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-ready">
        {stepErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            {stepErrors.map((e, i) => (
              <p key={i} className="text-sm text-red-600 font-medium">• {e}</p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 xl:col-span-8">

            {/* STEP 1: CART REVIEW */}
            <div style={{ display: step === 1 ? 'block' : 'none' }}>
              <h2 className="text-xl font-bold text-[#0F3D6E] mb-6">Resumen del carrito</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 flex items-center gap-3">
                {empresaGroup.empresa.logo ? (
                  <img src={`http://localhost:8000/storage/${empresaGroup.empresa.logo}`} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#0F3D6E] text-white flex items-center justify-center font-bold">
                    {empresaGroup.empresa.nombre_comercial.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#6B7A90] uppercase tracking-wider">Comprando a</p>
                  <p className="font-bold text-[#0F3D6E]">{empresaGroup.empresa.nombre_comercial}</p>
                </div>
              </div>
              <div className="space-y-3">
                {empresaGroup.items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#F0F6FC] flex items-center justify-center text-2xl shrink-0">
                      {item.tipo === 'servicio' ? '🛠️' : '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#0F3D6E] text-sm sm:text-base truncate">{item.nombre}</h3>
                      <p className="text-xs text-[#6B7A90] font-medium mt-0.5 capitalize">{item.tipo} • x{item.cantidad}</p>
                    </div>
                    <p className="font-bold text-[#0F3D6E] text-sm shrink-0">${Number(item.precio).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Link to="/carrito" className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-[#1D6FAD] hover:underline">
                <Icons.ArrowLeft /> Editar carrito
              </Link>
            </div>

            {/* STEP 2: ENTREGA & CONTACTO */}
            <div style={{ display: step === 2 ? 'block' : 'none' }}>
              <h2 className="text-xl font-bold text-[#0F3D6E] mb-6">Entrega y contacto</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                {/* Tipo de entrega */}
                <div>
                  <label className="block text-xs font-bold text-[#0F3D6E] mb-3 uppercase tracking-wider">Tipo de entrega</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { id: 'fisica' as const, label: 'Entrega física', desc: 'A tu dirección', emoji: '📦' },
                      { id: 'digital' as const, label: 'Digital', desc: 'Sin dirección física', emoji: '📧' },
                    ]).map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTipoEntrega(opt.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          tipoEntrega === opt.id ? 'border-[#1D6FAD] bg-[#1D6FAD]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="text-2xl mb-1">{opt.emoji}</p>
                        <p className="font-bold text-sm text-[#0F3D6E]">{opt.label}</p>
                        <p className="text-xs text-[#6B7A90]">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teléfono siempre requerido */}
                <div>
                  <label className="block text-xs font-bold text-[#0F3D6E] mb-2 uppercase tracking-wider">Teléfono de contacto *</label>
                  <input
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="0412-1234567"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1D6FAD] focus:ring-2 focus:ring-[#1D6FAD]/10 transition-all"
                  />
                </div>

                {/* Dirección (sólo física) */}
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: tipoEntrega === 'fisica' ? '600px' : '0',
                    opacity: tipoEntrega === 'fisica' ? 1 : 0,
                  }}
                >
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs font-bold text-[#0F3D6E] uppercase tracking-wider">Dirección de entrega</p>
                      {perfilLoaded && direccion && <span className="text-xs text-[#00B4D8] font-semibold">• Precargada desde tu perfil</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7A90] mb-1">Dirección *</label>
                      <input
                        value={direccion}
                        onChange={e => setDireccion(e.target.value)}
                        placeholder="Av. Principal, Edificio, Piso, Apto..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1D6FAD] focus:ring-2 focus:ring-[#1D6FAD]/10 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1">Ciudad *</label>
                        <select
                          value={ciudadId}
                          onChange={e => { setCiudadId(e.target.value); setMunicipioId('') }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1D6FAD] focus:ring-2 focus:ring-[#1D6FAD]/10 transition-all"
                        >
                          <option value="">Selecciona ciudad</option>
                          {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1">Municipio</label>
                        <select
                          value={municipioId}
                          onChange={e => setMunicipioId(e.target.value)}
                          disabled={!ciudadId}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1D6FAD] focus:ring-2 focus:ring-[#1D6FAD]/10 transition-all disabled:opacity-60"
                        >
                          <option value="">Selecciona municipio</option>
                          {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7A90] mb-1">Punto de referencia</label>
                      <input
                        value={referenciaEntrega}
                        onChange={e => setReferenciaEntrega(e.target.value)}
                        placeholder="Cerca de..., portón negro, casa azul..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1D6FAD] focus:ring-2 focus:ring-[#1D6FAD]/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-xs font-bold text-[#0F3D6E] mb-2 uppercase tracking-wider">Notas para la empresa (opcional)</label>
                  <textarea
                    value={notasCliente}
                    onChange={e => setNotasCliente(e.target.value)}
                    placeholder="Cualquier detalle útil para la empresa..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1D6FAD] focus:ring-2 focus:ring-[#1D6FAD]/10 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: PAGO */}
            <div style={{ display: step === 3 ? 'block' : 'none' }}>
              <h2 className="text-xl font-bold text-[#0F3D6E] mb-6">Método de pago</h2>

              {empresaGroup.metodos_pago.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                  <p className="font-bold text-amber-800 mb-1">Esta empresa aún no ha configurado métodos de pago</p>
                  <p className="text-sm text-amber-700">Contacta a la empresa para coordinar el pago manualmente.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {empresaGroup.metodos_pago.map(m => (
                      <button
                        key={m.tipo}
                        onClick={() => setMetodoPagoTipo(m.tipo as MetodoPagoTipo)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          metodoPagoTipo === m.tipo ? 'bg-[#0F3D6E] text-white shadow-lg'
                          : 'bg-white border border-gray-200 text-[#0F3D6E] hover:border-[#1D6FAD]'
                        }`}
                      >
                        <span>{(m.datos as any)?.icono || '💳'}</span>
                        <span>{m.tipo_nombre}</span>
                      </button>
                    ))}
                  </div>

                  {metodoSel && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="bg-[#F0F6FC] rounded-xl p-5 mb-5">
                        <h3 className="font-bold text-[#0F3D6E] text-sm mb-3">Datos para pagar</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {Object.entries(metodoSel.datos as any).filter(([k]) => k !== 'icono' && k !== 'tipo').map(([k, v]) => (
                            <div key={k}>
                              <span className="text-[#6B7A90] capitalize">{k.replace('_', ' ')}:</span>{' '}
                              <span className="font-bold text-[#0F3D6E] break-all">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-[#0F3D6E] mb-2 uppercase tracking-wider">Referencia / N° de transacción</label>
                          <input
                            value={referenciaPago}
                            onChange={e => setReferenciaPago(e.target.value)}
                            placeholder="Ej: 123456789"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1D6FAD] focus:ring-2 focus:ring-[#1D6FAD]/10 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#0F3D6E] mb-2 uppercase tracking-wider">Comprobante de pago *</label>
                          <label className="block cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleFile(e.target.files?.[0] ?? null)}
                            />
                            {comprobantePreview ? (
                              <div className="relative border-2 border-[#1D6FAD] rounded-xl p-3 bg-[#1D6FAD]/5">
                                <img src={comprobantePreview} alt="Comprobante" className="max-h-56 mx-auto rounded-lg object-contain" />
                                <p className="text-xs text-center mt-2 font-semibold text-[#1D6FAD]">Clic para cambiar</p>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1D6FAD] hover:bg-[#1D6FAD]/5 transition-all">
                                <div className="inline-flex items-center gap-2 text-[#6B7A90]">
                                  <Icons.Upload />
                                  <span className="text-sm font-semibold">Subir imagen del comprobante</span>
                                </div>
                                <p className="text-xs text-[#6B7A90] mt-2">JPG / PNG, máx. 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* NAV BUTTONS */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button onClick={prevStep} className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-[#0F3D6E] hover:border-[#1D6FAD] transition-colors">
                  <Icons.ChevronLeft /> Anterior
                </button>
              ) : <div />}
              {step < 3 ? (
                <button onClick={nextStep} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #0F3D6E 0%, #1D6FAD 55%, #00B4D8 100%)' }}>
                  Siguiente <Icons.ChevronRight />
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing || !metodoPagoTipo}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #0F3D6E 0%, #1D6FAD 55%, #00B4D8 100%)' }}
                >
                  {isProcessing ? (
                    <><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.42" strokeDashoffset="10" strokeLinecap="round"/></svg> Procesando...</>
                  ) : 'Confirmar pedido'}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
                <h3 className="font-bold text-[#0F3D6E] text-sm uppercase tracking-wider mb-4">Resumen del pedido</h3>

                <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
                  {empresaGroup.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F0F6FC] flex items-center justify-center text-lg shrink-0">
                        {item.tipo === 'servicio' ? '🛠️' : '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0F3D6E] truncate">{item.nombre}</p>
                        <p className="text-xs text-[#6B7A90]">x{item.cantidad}</p>
                      </div>
                      <p className="text-xs font-bold text-[#0F3D6E] shrink-0">${Number(item.precio).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7A90]">Subtotal</span>
                    <span className="font-semibold text-[#0F3D6E]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7A90]">Envío</span>
                    <span className="font-semibold text-green-600">Gratis</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between items-center">
                    <span className="font-bold text-[#0F3D6E]">Total</span>
                    <span className="font-bold text-xl text-[#0F3D6E]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-[#6B7A90] mt-4">
                Al confirmar, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-ready { opacity: 0; transform: translateY(10px); }
        .animate-in { opacity: 1 !important; transform: translateY(0) !important; transition: all 400ms ease-out; }
      `}</style>
    </div>
  )
}
