import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../services/api'
import { useAuth } from './AuthContext'

export interface CartItem {
  id: number
  tipo: 'servicio' | 'producto'
  servicio_id?: number
  producto_id?: number
  nombre: string
  descripcion: string
  precio: number
  cantidad: number
  es_basico?: boolean
}

export interface CartEmpresa {
  empresa_id: number
  empresa: {
    id: number
    nombre_comercial: string
    logo?: string
  }
  metodos_pago: {
    tipo: string
    tipo_nombre: string
    datos: string
  }[]
  items: CartItem[]
  subtotal: number
}

export interface Cart {
  por_empresa: CartEmpresa[]
  total: number
  total_items: number
}

export type AddToCartResult =
  | { ok: true }
  | { ok: false; conflict: true; empresaActual: { id: number; nombre_comercial: string } }
  | { ok: false; conflict: false; message: string }

interface CartContextType {
  cart: Cart | null
  loading: boolean
  error: string | null
  itemCount: number
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  fetchCart: () => Promise<void>
  addToCart: (
    tipo: 'servicio' | 'producto',
    id: number,
    cantidad?: number,
    opts?: { force?: boolean }
  ) => Promise<AddToCartResult>
  updateCantidad: (itemId: number, cantidad: number) => Promise<{ ok: boolean; message?: string }>
  removeFromCart: (itemId: number) => Promise<boolean>
  clearCart: () => Promise<boolean>
  clearEmpresa: (empresaId: number) => Promise<boolean>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [itemCount, setItemCount] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (user && token) {
      fetchCart()
      fetchCartCount()
    } else {
      setCart(null)
      setItemCount(0)
    }
  }, [user, token])

  const fetchCart = async () => {
    if (!token) return
    
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/carrito')
      setCart(res.data.data)
      setItemCount(res.data.data.total_items)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el carrito')
    } finally {
      setLoading(false)
    }
  }

  const fetchCartCount = async () => {
    if (!token) return
    
    try {
      const res = await api.get('/carrito/count')
      setItemCount(res.data.count)
    } catch {
      // Silently fail for count
    }
  }

  const addToCart = async (
    tipo: 'servicio' | 'producto',
    id: number,
    cantidad: number = 1,
    opts?: { force?: boolean }
  ): Promise<AddToCartResult> => {
    setLoading(true)
    setError(null)
    try {
      const data = tipo === 'servicio'
        ? { servicio_id: id, cantidad: 1 }
        : { producto_id: id, cantidad }

      const url = opts?.force ? '/carrito?force=true' : '/carrito'
      const res = await api.post(url, data)

      if (res.data.success) {
        setItemCount(res.data.cart_count)
        await fetchCart()
        setDrawerOpen(true)
        return { ok: true }
      }
      return { ok: false, conflict: false, message: res.data.message || 'Error al agregar al carrito' }
    } catch (err: any) {
      const resp = err.response?.data
      if (err.response?.status === 409 && resp?.conflict && resp?.empresa_actual) {
        return { ok: false, conflict: true, empresaActual: resp.empresa_actual }
      }
      const msg = resp?.message || 'Error al agregar al carrito'
      setError(msg)
      return { ok: false, conflict: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const updateCantidad = async (itemId: number, cantidad: number) => {
    try {
      const res = await api.put(`/carrito/${itemId}`, { cantidad })
      if (res.data.success) {
        setItemCount(res.data.cart_count)
        await fetchCart()
        return { ok: true }
      }
      return { ok: false, message: res.data.message }
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.message || 'Error al actualizar cantidad' }
    }
  }

  const removeFromCart = async (itemId: number) => {
    setLoading(true)
    try {
      const res = await api.delete(`/carrito/${itemId}`)
      
      if (res.data.success) {
        setItemCount(res.data.cart_count)
        await fetchCart()
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    setLoading(true)
    try {
      const res = await api.delete('/carrito')
      
      if (res.data.success) {
        setCart(null)
        setItemCount(0)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }

  const clearEmpresa = async (empresaId: number) => {
    setLoading(true)
    try {
      const res = await api.delete(`/carrito/empresa/${empresaId}`)
      
      if (res.data.success) {
        setItemCount(res.data.cart_count)
        await fetchCart()
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        loading, 
        error, 
        itemCount,
        drawerOpen,
        openDrawer,
        closeDrawer,
        fetchCart,
        addToCart,
        updateCantidad,
        removeFromCart,
        clearCart,
        clearEmpresa
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}
