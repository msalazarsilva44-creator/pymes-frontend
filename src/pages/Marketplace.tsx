import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import { useBackButtonGuard } from '../hooks/useBackButtonGuard'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, LogIn, UserPlus, SlidersHorizontal, Package } from 'lucide-react'
import Pagination from '../components/Pagination'
import BackButtonModal from '../components/BackButtonModal'
import SearchHero from '../components/Marketplace/SearchHero'
import CategoryGrid, { type CategoriaItem } from '../components/Marketplace/CategoryGrid'
import FeaturedBusiness, { type EmpresaDestacada } from '../components/Marketplace/FeaturedBusiness'
import ServiceCard, { type ServicioListado } from '../components/Marketplace/ServiceCard'
import EmptyState from '../components/Marketplace/EmptyState'
import { CategorySkeleton, CardSkeleton } from '../components/Marketplace/Skeletons'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

// Cache con localStorage para persistir entre recargas
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

const parseRatingValue = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const hasDestacadoFlag = (empresa: Record<string, unknown>): boolean => {
  return Boolean(
    empresa?.destacado ||
    empresa?.destacada ||
    empresa?.es_destacado ||
    empresa?.is_destacado ||
    empresa?.featured
  )
}

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
  const [showFilters, setShowFilters] = useState(false)
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

  const currentSearchValue = tab === 'servicios' ? searchServicios : searchProductos

  const categoriaItems = useMemo<CategoriaItem[]>(() => {
    if (!Array.isArray(categorias)) return []
    return categorias.map((cat: any) => ({
      id: Number(cat.id),
      nombre: cat.nombre ?? 'Sin nombre',
      slug: cat.slug ?? undefined,
      empresas_count: cat.empresas_count ?? cat.empresas?.length ?? undefined,
      servicios_count: cat.servicios_count ?? cat.servicios?.length ?? undefined,
      productos_count: cat.productos_count ?? cat.productos?.length ?? undefined,
    }))
  }, [categorias])

  const featuredEmpresa = useMemo<EmpresaDestacada | null>(() => {
    if (!Array.isArray(empresas) || empresas.length === 0) return null

    const flagged = empresas.find((empresa) => hasDestacadoFlag(empresa))
    if (flagged) return flagged

    const sorted = [...empresas].sort((a, b) => parseRatingValue(b.calificacion_promedio) - parseRatingValue(a.calificacion_promedio))
    return sorted[0] ?? null
  }, [empresas])

  const topRatedEmpresas = useMemo<ServicioListado[]>(() => {
    if (!Array.isArray(empresas)) return []
    const sorted = [...empresas]
      .filter((empresa) => parseRatingValue(empresa.calificacion_promedio) > 0)
      .sort((a, b) => parseRatingValue(b.calificacion_promedio) - parseRatingValue(a.calificacion_promedio))
    return sorted.slice(0, 6)
  }, [empresas])

  const activeCategoriaId = catServicios ? Number(catServicios) : undefined

  const handleCategorySelect = useCallback((categoriaId: number) => {
    setTab('servicios')
    setCatServicios(String(categoriaId))
    setShowFilters(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSeeAllCategories = useCallback(() => {
    setCatServicios('')
    setTab('servicios')
  }, [])

  const handleHeroChange = useCallback((value: string) => {
    if (tab === 'servicios') {
      setSearchServicios(value)
    } else {
      setSearchProductos(value)
    }
  }, [tab])

  const handleHeroSubmit = useCallback(() => {
    if (tab === 'servicios') {
      setPageServicios(1)
    } else {
      setPageProductos(1)
    }
  }, [tab])

  const handleClearFilters = useCallback(() => {
    setSearchServicios('')
    setCatServicios('')
    setCiuServicios('')
    setPrecioMinServicios('')
    setPrecioMaxServicios('')
    setOrdenServicios('')
    setSearchProductos('')
    setCatProductos('')
    setCiuProductos('')
    setPrecioMinProductos('')
    setPrecioMaxProductos('')
    setOrdenProductos('')
    setPageServicios(1)
    setPageProductos(1)
  }, [])

  const isLoadingServicios = loading && tab === 'servicios'
  const isLoadingProductos = loading && tab === 'productos'
  const isInitialServicios = isLoadingServicios && empresas.length === 0
  const isInitialProductos = isLoadingProductos && productos.length === 0

  const anyFilterActive = Boolean(
    searchServicios || searchProductos || catServicios || catProductos ||
    ciuServicios || ciuProductos || precioMinServicios || precioMaxServicios ||
    precioMinProductos || precioMaxProductos || ordenServicios || ordenProductos
  )

  const filterContent = (
    <>
      <p className="font-heading text-lg font-semibold text-brand-navy">Descubre a tu modo</p>
      <div className="mt-4 flex gap-2 rounded-2xl bg-brand-cyanlt/80 p-1">
        <button
          type="button"
          onClick={() => setTab('servicios')}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === 'servicios' ? 'bg-white text-brand-navy shadow-lg' : 'text-brand-deep/60 hover:text-brand-navy'}`}
        >
          Servicios
        </button>
        <button
          type="button"
          onClick={() => setTab('productos')}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === 'productos' ? 'bg-white text-brand-navy shadow-lg' : 'text-brand-deep/60 hover:text-brand-navy'}`}
        >
          Productos
        </button>
      </div>

      <div className="mt-5 space-y-4 text-sm">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/60" htmlFor="filter-search">
            Buscar
          </label>
          <input
            id="filter-search"
            type="text"
            value={tab === 'servicios' ? searchServicios : searchProductos}
            onChange={(e) => tab === 'servicios' ? setSearchServicios(e.target.value) : setSearchProductos(e.target.value)}
            placeholder={tab === 'servicios' ? 'Nombre de empresa o servicio' : 'Nombre del producto'}
            className="w-full rounded-xl border border-brand-cyan/20 bg-brand-cyanlt/40 px-4 py-3 font-medium text-brand-deep placeholder:text-brand-deep/40 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/60" htmlFor="filter-category">
            Categoría
          </label>
          <select
            id="filter-category"
            value={tab === 'servicios' ? catServicios : catProductos}
            onChange={(e) => tab === 'servicios' ? setCatServicios(e.target.value) : setCatProductos(e.target.value)}
            className="w-full rounded-xl border border-brand-cyan/20 bg-white px-4 py-3 font-medium text-brand-deep focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/60" htmlFor="filter-city">
            Ciudad
          </label>
          <select
            id="filter-city"
            value={tab === 'servicios' ? ciuServicios : ciuProductos}
            onChange={(e) => tab === 'servicios' ? setCiuServicios(e.target.value) : setCiuProductos(e.target.value)}
            className="w-full rounded-xl border border-brand-cyan/20 bg-white px-4 py-3 font-medium text-brand-deep focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
          >
            <option value="">Todas</option>
            {ciudades.map((ciudad) => (
              <option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/60">
            Rango de precio
          </span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={tab === 'servicios' ? precioMinServicios : precioMinProductos}
              onChange={(e) => tab === 'servicios' ? setPrecioMinServicios(e.target.value) : setPrecioMinProductos(e.target.value)}
              placeholder="Min"
              className="rounded-xl border border-brand-cyan/20 bg-white px-4 py-3 font-medium text-brand-deep focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
            />
            <input
              type="number"
              min="0"
              value={tab === 'servicios' ? precioMaxServicios : precioMaxProductos}
              onChange={(e) => tab === 'servicios' ? setPrecioMaxServicios(e.target.value) : setPrecioMaxProductos(e.target.value)}
              placeholder="Max"
              className="rounded-xl border border-brand-cyan/20 bg-white px-4 py-3 font-medium text-brand-deep focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/60" htmlFor="filter-order">
            Ordenar por
          </label>
          <select
            id="filter-order"
            value={tab === 'servicios' ? ordenServicios : ordenProductos}
            onChange={(e) => tab === 'servicios' ? setOrdenServicios(e.target.value) : setOrdenProductos(e.target.value)}
            className="w-full rounded-xl border border-brand-cyan/20 bg-white px-4 py-3 font-medium text-brand-deep focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
          >
            <option value="">Más recientes</option>
            <option value="precio_asc">Precio: Menor a Mayor</option>
            <option value="precio_desc">Precio: Mayor a Menor</option>
            <option value="mejor_calificacion">Mejor calificación</option>
            <option value="mas_vendidos">Más vendidos</option>
          </select>
        </div>

        {anyFilterActive && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full rounded-full border border-brand-cyan bg-white px-4 py-2 text-sm font-semibold text-brand-cyan transition hover:bg-brand-cyan/10"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </>
  )

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
      <div className="min-h-screen bg-[#F4F7FA] text-brand-deep">
        <header className="bg-brand-navy text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
            <Link to="/" className="flex items-center gap-3 text-white transition hover:text-brand-cyan">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-cyan text-brand-deep shadow-lg">
                <TrendingUp className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-lg font-semibold tracking-[0.2em]">MERCAROF</span>
            </Link>
            <div className="hidden items-center gap-3 md:flex">
              <Link to="/login" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white">
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
              <Link to="/registro" className="flex items-center gap-2 rounded-full bg-brand-cyan px-5 py-2 text-sm font-semibold text-brand-deep shadow-lg transition hover:bg-brand-cyan/90">
                <UserPlus className="h-4 w-4" />
                Registrarse
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </button>
          </div>
        </header>

        <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-6 md:px-8">
          <SearchHero
            value={currentSearchValue}
            onChange={handleHeroChange}
            onSubmit={handleHeroSubmit}
            loading={loading}
            tab={tab}
          />

          <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="self-start">
              <details
                className="mb-6 flex flex-col rounded-3xl bg-white p-4 shadow-[0_16px_40px_rgba(14,58,95,0.08)] lg:hidden"
                open={showFilters}
                onToggle={(event) => setShowFilters((event.target as HTMLDetailsElement).open)}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-brand-navy">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                  </span>
                  <span className="text-xs font-medium text-brand-deep/50">{showFilters ? 'Ocultar' : 'Mostrar'}</span>
                </summary>
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl bg-white p-1">
                    {filterContent}
                  </div>
                </div>
              </details>

              <div className="sticky top-24 hidden rounded-3xl bg-white p-4 shadow-[0_16px_40px_rgba(14,58,95,0.08)] lg:block">
                {filterContent}
              </div>
            </aside>

            {/* Contenido principal */}
            <div className="flex flex-col gap-10">
              <section className="space-y-6">
                {categoriaItems.length > 0 ? (
                  <CategoryGrid
                    categorias={categoriaItems}
                    onSelect={handleCategorySelect}
                    activeId={activeCategoriaId}
                    onSeeAll={handleSeeAllCategories}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <CategorySkeleton key={idx} />
                    ))}
                  </div>
                )}
              </section>

              {featuredEmpresa && (
                <FeaturedBusiness empresa={featuredEmpresa} />
              )}

              {topRatedEmpresas.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-heading text-2xl font-semibold text-brand-navy">Mejor valorados</h2>
                      <p className="text-sm font-medium text-brand-deep/70">Negocios con calificaciones sobresalientes de nuestra comunidad</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-sm font-semibold text-brand-cyan underline-offset-4 transition hover:text-brand-cyan/80"
                    >
                      Ver más
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {topRatedEmpresas.map((empresa) => (
                      <ServiceCard key={empresa.id} empresa={empresa} />
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-heading text-2xl font-semibold text-brand-navy">
                    {tab === 'servicios' ? 'Empresas con servicios' : 'Productos destacados'}
                  </h2>
                  <div className="flex gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-deep/40">
                    {tab === 'servicios' ? `Página ${paginationServicios.currentPage} de ${paginationServicios.lastPage}` : `Página ${paginationProductos.currentPage} de ${paginationProductos.lastPage}`}
                  </div>
                </div>

                {tab === 'servicios' ? (
                  isInitialServicios ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <CardSkeleton key={idx} />
                      ))}
                    </div>
                  ) : empresas.length === 0 ? (
                    <EmptyState
                      title="No encontramos coincidencias"
                      description="Prueba ajustando tus filtros o explora otras categorías populares."
                      actionLabel={anyFilterActive ? 'Limpiar búsqueda' : undefined}
                      onAction={anyFilterActive ? handleClearFilters : undefined}
                    />
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {empresas.map((empresa) => (
                          <ServiceCard key={empresa.id} empresa={empresa} />
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
                  isInitialProductos ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <CardSkeleton key={idx} />
                      ))}
                    </div>
                  ) : productos.length === 0 ? (
                    <EmptyState
                      title="No hay productos disponibles"
                      description="Ajusta los filtros o vuelve más tarde para descubrir nuevas ofertas."
                      actionLabel={anyFilterActive ? 'Limpiar filtros' : undefined}
                      onAction={anyFilterActive ? handleClearFilters : undefined}
                      icon={<Package className="h-10 w-10" />}
                    />
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {productos.map((producto) => (
                          <Link
                            key={producto.id}
                            to={`/empresa/${producto.empresa?.id}`}
                            className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_16px_40px_rgba(14,58,95,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(14,58,95,0.16)]"
                          >
                            <div className="relative aspect-[4/3] bg-brand-cyanlt">
                              {producto.imagenes && producto.imagenes.length > 0 ? (
                                <img
                                  src={`${API_URL}${producto.imagenes[0].url}`}
                                  alt={producto.nombre}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-brand-navy/30">
                                  <Package className="h-10 w-10" />
                                </div>
                              )}
                              {producto.empresa?.logo && (
                                <img
                                  src={`${API_URL}${producto.empresa.logo}`}
                                  alt={producto.empresa.nombre_comercial}
                                  className="absolute left-4 top-4 h-12 w-12 rounded-xl border-2 border-white object-cover shadow-lg"
                                  loading="lazy"
                                />
                              )}
                            </div>
                            <div className="flex flex-1 flex-col gap-3 p-5">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-heading text-lg font-semibold text-brand-navy line-clamp-1">{producto.nombre}</h3>
                                {producto.precio && (
                                  <span className="rounded-full bg-brand-cyan/10 px-3 py-1 text-xs font-semibold text-brand-navy">
                                    ${Number(producto.precio).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </div>
                              {producto.descripcion && (
                                <p className="text-sm font-medium text-brand-deep/70 line-clamp-2">{producto.descripcion}</p>
                              )}
                              <div className="mt-auto flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-deep/60">
                                {producto.empresa?.nombre_comercial && (
                                  <span className="rounded-full bg-brand-cyanlt px-3 py-1 text-brand-navy">
                                    {producto.empresa.nombre_comercial}
                                  </span>
                                )}
                                {typeof producto.cantidad === 'number' && (
                                  <span className="rounded-full border border-brand-cyan/20 px-3 py-1">
                                    Stock: {producto.cantidad}
                                  </span>
                                )}
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
              </section>
            </div>
          </section>
        </main>
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
