import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import { useBackButtonGuard } from '../hooks/useBackButtonGuard'
import { useAuth } from '../context/AuthContext'
import { Search, MapPin, Package, Wrench } from 'lucide-react'
import Navbar from '../components/Navbar'
import Pagination from '../components/Pagination'
import BackButtonModal from '../components/BackButtonModal'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

// Cache con localStorage para persistir entre recargas
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

const getCache = (key: string) => {
  try {
    const item = localStorage.getItem(`marketplace_cache_${key}`)
    if (!item) return null
    const parsed = JSON.parse(item)
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(`marketplace_cache_${key}`)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

const setCache = (key: string, data: any) => {
  try {
    localStorage.setItem(`marketplace_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch {
    // Silently fail if localStorage is full
  }
}

interface PaginationState {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
}

const defaultPagination: PaginationState = { currentPage: 1, lastPage: 1, total: 0, perPage: 24 }

const getInitialCategorias = () => getCache('categorias') || []
const getInitialCiudades = () => getCache('ciudades') || []

export default function Marketplace() {
  const { token, logout } = useAuth()
  const [showExitModal, setShowExitModal] = useState(false)

  useBackButtonGuard(useCallback(() => {
    if (token) setShowExitModal(true)
  }, [token]))

  const [tab, setTab] = useState<'servicios' | 'productos'>('servicios')
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>(getInitialCategorias)
  const [ciudades, setCiudades] = useState<any[]>(getInitialCiudades)
  const [loading, setLoading] = useState(false)

  // Paginación por tab
  const [paginationServicios, setPaginationServicios] = useState<PaginationState>(defaultPagination)
  const [paginationProductos, setPaginationProductos] = useState<PaginationState>(defaultPagination)
  const [pageServicios, setPageServicios] = useState(1)
  const [pageProductos, setPageProductos] = useState(1)
  
  // Abort controllers para cancelar peticiones
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMounted = useRef(true)
  
  // Filtros servicios
  const [searchServicios, setSearchServicios] = useState('')
  const [catServicios, setCatServicios] = useState('')
  const [ciuServicios, setCiuServicios] = useState('')
  const [precioMinServicios, setPrecioMinServicios] = useState('')
  const [precioMaxServicios, setPrecioMaxServicios] = useState('')
  const [ordenServicios, setOrdenServicios] = useState('')
  
  // Filtros productos
  const [searchProductos, setSearchProductos] = useState('')
  const [catProductos, setCatProductos] = useState('')
  const [ciuProductos, setCiuProductos] = useState('')
  const [precioMinProductos, setPrecioMinProductos] = useState('')
  const [precioMaxProductos, setPrecioMaxProductos] = useState('')
  const [ordenProductos, setOrdenProductos] = useState('')

  // Debounce de búsquedas (300ms)
  const debouncedSearchServicios = useDebounce(searchServicios, 300)
  const debouncedSearchProductos = useDebounce(searchProductos, 300)

  // Cleanup on unmount (reset on mount for React StrictMode)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Cargar datos iniciales solo una vez con cache
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      // Intentar usar cache primero
      const cachedCats = getCache('categorias')
      const cachedCiuds = getCache('ciudades')
      
      if (cachedCats) setCategorias(cachedCats)
      if (cachedCiuds) setCiudades(cachedCiuds)
      
      try {
        const [catsRes, ciudsRes] = await Promise.all([
          api.get('/categorias'),
          api.get('/ciudades')
        ])
        const cats = Array.isArray(catsRes.data.data) ? catsRes.data.data : []
        const ciuds = Array.isArray(ciudsRes.data) ? ciudsRes.data : []
        
        if (isMounted.current) {
          setCategorias(cats)
          setCiudades(ciuds)
          setCache('categorias', cats)
          setCache('ciudades', ciuds)
        }
      } catch (err) {
        console.error('Error al cargar datos:', err)
      }
    }
    cargarDatosIniciales()
  }, [])

  // Referencias para trackear si es carga inicial
  const isFirstLoadServicios = useRef(true)
  const isFirstLoadProductos = useRef(true)
  
  // Resetear página al cambiar filtros de servicios
  useEffect(() => {
    setPageServicios(1)
  }, [debouncedSearchServicios, catServicios, ciuServicios, precioMinServicios, precioMaxServicios, ordenServicios])

  // Buscar servicios con cache + debounce + AbortController + paginación
  useEffect(() => {
    if (tab !== 'servicios') return
    
    const searchTerm = isFirstLoadServicios.current ? searchServicios : debouncedSearchServicios
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const controller = new AbortController()
    abortControllerRef.current = controller
    
    const buscarServicios = async () => {
      const cacheKey = `servicios-${JSON.stringify({
        search: searchTerm,
        cat: catServicios,
        ciu: ciuServicios,
        min: precioMinServicios,
        max: precioMaxServicios,
        ord: ordenServicios,
        page: pageServicios
      })}`
      
      const cached = getCache(cacheKey)
      if (cached && isMounted.current) {
        setEmpresas(cached.items)
        setPaginationServicios(cached.pagination)
        if (!isFirstLoadServicios.current) {
          setLoading(false)
        }
      }
      
      if (!cached || isFirstLoadServicios.current) {
        setLoading(true)
      }
      
      try {
        const params: any = { page: pageServicios, per_page: 24 }
        if (searchTerm) params.search = searchTerm
        if (catServicios) params.categoria_id = catServicios
        if (ciuServicios) params.ciudad_id = ciuServicios
        if (precioMinServicios) params.precio_min = precioMinServicios
        if (precioMaxServicios) params.precio_max = precioMaxServicios
        if (ordenServicios) params.orden = ordenServicios

        const res = await api.get('/empresas/con-servicios', { 
          params,
          signal: controller.signal
        })
        
        if (isMounted.current) {
          const data = res.data.data || []
          const pagination = res.data.pagination || defaultPagination
          setEmpresas(data)
          setPaginationServicios({
            currentPage: pagination.current_page,
            lastPage: pagination.last_page,
            total: pagination.total,
            perPage: pagination.per_page,
          })
          setCache(cacheKey, { items: data, pagination: {
            currentPage: pagination.current_page,
            lastPage: pagination.last_page,
            total: pagination.total,
            perPage: pagination.per_page,
          }})
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error('Error al buscar empresas:', err)
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
          isFirstLoadServicios.current = false
        }
      }
    }

    buscarServicios()
    
    return () => controller.abort()
  }, [tab, debouncedSearchServicios, catServicios, ciuServicios, precioMinServicios, precioMaxServicios, ordenServicios, searchServicios, pageServicios])

  // Resetear página al cambiar filtros de productos
  useEffect(() => {
    setPageProductos(1)
  }, [debouncedSearchProductos, catProductos, ciuProductos, precioMinProductos, precioMaxProductos, ordenProductos])

  // Buscar productos con cache + debounce + AbortController + paginación
  useEffect(() => {
    if (tab !== 'productos') return
    
    const searchTerm = isFirstLoadProductos.current ? searchProductos : debouncedSearchProductos
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const controller = new AbortController()
    abortControllerRef.current = controller
    
    const buscarProductos = async () => {
      const cacheKey = `productos-${JSON.stringify({
        search: searchTerm,
        cat: catProductos,
        ciu: ciuProductos,
        min: precioMinProductos,
        max: precioMaxProductos,
        ord: ordenProductos,
        page: pageProductos
      })}`
      
      const cached = getCache(cacheKey)
      if (cached && isMounted.current) {
        setProductos(cached.items)
        setPaginationProductos(cached.pagination)
        if (!isFirstLoadProductos.current) {
          setLoading(false)
        }
      }
      
      if (!cached || isFirstLoadProductos.current) {
        setLoading(true)
      }
      
      try {
        const params: any = { page: pageProductos, per_page: 24 }
        if (searchTerm) params.search = searchTerm
        if (catProductos) params.categoria_id = catProductos
        if (ciuProductos) params.ciudad_id = ciuProductos
        if (precioMinProductos) params.precio_min = precioMinProductos
        if (precioMaxProductos) params.precio_max = precioMaxProductos
        if (ordenProductos) params.orden = ordenProductos

        const res = await api.get('/productos/todos', { 
          params,
          signal: controller.signal
        })
        
        if (isMounted.current) {
          const data = res.data.data || []
          const pagination = res.data.pagination || defaultPagination
          setProductos(data)
          setPaginationProductos({
            currentPage: pagination.current_page,
            lastPage: pagination.last_page,
            total: pagination.total,
            perPage: pagination.per_page,
          })
          setCache(cacheKey, { items: data, pagination: {
            currentPage: pagination.current_page,
            lastPage: pagination.last_page,
            total: pagination.total,
            perPage: pagination.per_page,
          }})
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error('Error al buscar productos:', err)
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
          isFirstLoadProductos.current = false
        }
      }
    }

    buscarProductos()
    
    return () => controller.abort()
  }, [tab, debouncedSearchProductos, catProductos, ciuProductos, precioMinProductos, precioMaxProductos, ordenProductos, searchProductos, pageProductos])

  // Handlers de cambio de página con scroll to top
  const handlePageChangeServicios = (page: number) => {
    setPageServicios(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageChangeProductos = (page: number) => {
    setPageProductos(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Bloquear navegación hacia atrás cuando hay filtros activos
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasFilters = searchServicios || searchProductos || catServicios || catProductos ||
                         ciuServicios || ciuProductos || precioMinServicios || precioMaxServicios ||
                         precioMinProductos || precioMaxProductos
      if (hasFilters) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [searchServicios, searchProductos, catServicios, catProductos, ciuServicios, ciuProductos, precioMinServicios, precioMaxServicios, precioMinProductos, precioMaxProductos])

  return (
    <>
    <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-mercarof-navy to-mercarof-cyan text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-white/90 mt-1">Encuentra los mejores servicios y productos locales</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar con filtros */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setTab('servicios')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    tab === 'servicios'
                      ? 'bg-mercarof-navy text-white shadow-lg shadow-mercarof-navy/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Servicios
                </button>
                <button
                  onClick={() => setTab('productos')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    tab === 'productos'
                      ? 'bg-mercarof-navy text-white shadow-lg shadow-mercarof-navy/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Productos
                </button>
              </div>

              {/* Búsqueda */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={tab === 'servicios' ? searchServicios : searchProductos}
                    onChange={(e) => tab === 'servicios' ? setSearchServicios(e.target.value) : setSearchProductos(e.target.value)}
                    placeholder={tab === 'servicios' ? 'Buscar servicios...' : 'Buscar productos...'}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría</label>
                <select
                  value={tab === 'servicios' ? catServicios : catProductos}
                  onChange={(e) => tab === 'servicios' ? setCatServicios(e.target.value) : setCatProductos(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:border-transparent text-sm transition-all"
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Ciudad */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ciudad</label>
                <select
                  value={tab === 'servicios' ? ciuServicios : ciuProductos}
                  onChange={(e) => tab === 'servicios' ? setCiuServicios(e.target.value) : setCiuProductos(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:border-transparent text-sm transition-all"
                >
                  <option value="">Todas</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Rango de precio */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rango de precio</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={tab === 'servicios' ? precioMinServicios : precioMinProductos}
                    onChange={(e) => tab === 'servicios' ? setPrecioMinServicios(e.target.value) : setPrecioMinProductos(e.target.value)}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:border-transparent text-sm transition-all"
                  />
                  <input
                    type="number"
                    min="0"
                    value={tab === 'servicios' ? precioMaxServicios : precioMaxProductos}
                    onChange={(e) => tab === 'servicios' ? setPrecioMaxServicios(e.target.value) : setPrecioMaxProductos(e.target.value)}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Ordenar */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ordenar por</label>
                <select
                  value={tab === 'servicios' ? ordenServicios : ordenProductos}
                  onChange={(e) => tab === 'servicios' ? setOrdenServicios(e.target.value) : setOrdenProductos(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mercarof-cyan focus:border-transparent text-sm transition-all"
                >
                  <option value="">Más recientes</option>
                  <option value="precio_asc">Precio: Menor a Mayor</option>
                  <option value="precio_desc">Precio: Mayor a Menor</option>
                  <option value="mejor_calificacion">Mejor calificación</option>
                  <option value="mas_vendidos">Más vendidos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 relative">
            {/* Indicador de actualización en segundo plano */}
            {loading && (empresas.length > 0 || productos.length > 0) && (
              <div className="absolute top-0 right-0 p-2 z-10">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-mercarof-cyan" />
                  Actualizando...
                </div>
              </div>
            )}
            
            {/* Lista de resultados */}
            {loading && empresas.length === 0 && productos.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan" />
              </div>
            ) : tab === 'servicios' ? (
              empresas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No se encontraron empresas con servicios</p>
                  <p className="text-sm mt-2">Intenta con otros filtros de búsqueda</p>
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {empresas.map((empresa) => (
                    <Link
                      key={empresa.id}
                      to={`/empresa/${empresa.id}`}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] p-6 border border-gray-200 block relative"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    >
                      {/* Franja azul arriba */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mercarof-navy to-mercarof-cyan rounded-t-2xl"></div>

                      {/* Logo placeholder con inicial */}
                      <div className="flex items-start gap-4 mb-4 pt-2">
                        {empresa.logo ? (
                          <img
                            src={`${API_URL}${empresa.logo}`}
                            alt={empresa.nombre_comercial}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-mercarof-navy to-mercarof-cyan flex items-center justify-center border-2 border-gray-100">
                            <span className="text-white text-2xl font-bold">
                              {empresa.nombre_comercial?.charAt(0)?.toUpperCase() || 'E'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">{empresa.nombre_comercial}</h3>
                          {empresa.calificacion_promedio && (
                            <div className="flex items-center gap-1 text-sm text-amber-500 bg-amber-50 px-2 py-1 rounded-full w-fit mt-1">
                              <span>⭐</span>
                              <span className="font-semibold">{empresa.calificacion_promedio}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{empresa.descripcion || 'Sin descripción'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{empresa.ciudad?.nombre}, {empresa.municipio?.nombre}</span>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-800 mb-3">
                          {empresa.servicios_count || empresa.servicios?.length} {empresa.servicios_count === 1 ? 'servicio disponible' : 'servicios disponibles'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {empresa.servicios?.slice(0, 3).map((servicio: any) => (
                            <span key={servicio.id} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                              {servicio.nombre}
                            </span>
                          ))}
                          {(empresa.servicios?.length || 0) > 3 && (
                            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                              +{(empresa.servicios?.length || 0) - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-sm font-semibold text-mercarof-navy bg-blue-50 px-3 py-1.5 rounded-full">{empresa.categoria?.nombre}</span>
                        <span className="text-sm text-mercarof-cyan hover:underline font-semibold">
                          Ver empresa →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Pagination
                  currentPage={paginationServicios.currentPage}
                  lastPage={paginationServicios.lastPage}
                  total={paginationServicios.total}
                  perPage={paginationServicios.perPage}
                  onPageChange={handlePageChangeServicios}
                />
              </>
              )
            ) : (
              productos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No se encontraron productos</p>
                  <p className="text-sm mt-2">Intenta con otros filtros de búsqueda</p>
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {productos.map((producto) => (
                    <Link
                      key={producto.id}
                      to={`/empresa/${producto.empresa?.id}`}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] overflow-hidden border border-gray-200 block relative"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    >
                      {/* Franja azul arriba */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mercarof-navy to-mercarof-cyan z-10"></div>

                      <div className="relative aspect-square bg-gray-100">
                        {producto.imagenes && producto.imagenes.length > 0 ? (
                          <img
                            src={`${API_URL}${producto.imagenes[0].url}`}
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <Package className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        {/* Logo de la empresa superpuesto */}
                        <div className="absolute top-2 right-2 z-20">
                          {producto.empresa?.logo ? (
                            <img
                              src={`${API_URL}${producto.empresa.logo}`}
                              alt={producto.empresa.nombre_comercial}
                              className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-md"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-mercarof-navy to-mercarof-cyan flex items-center justify-center border-2 border-white shadow-md">
                              <span className="text-white text-sm font-bold">
                                {producto.empresa?.nombre_comercial?.charAt(0)?.toUpperCase() || 'E'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{producto.nombre}</h3>
                        {producto.descripcion && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{producto.descripcion}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-mercarof-navy font-bold text-lg">${producto.precio}</span>
                          <span className="text-xs font-semibold text-gray-600 bg-blue-50 px-3 py-1.5 rounded-full">Stock: {producto.cantidad}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Pagination
                  currentPage={paginationProductos.currentPage}
                  lastPage={paginationProductos.lastPage}
                  total={paginationProductos.total}
                  perPage={paginationProductos.perPage}
                  onPageChange={handlePageChangeProductos}
                />
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
    {token && (
      <BackButtonModal
        isOpen={showExitModal}
        onStay={() => setShowExitModal(false)}
        onLeave={() => { setShowExitModal(false); logout(); window.location.href = '/login' }}
      />
    )}
    </>
  )
}
