import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../services/api'
import { authStorage } from '../lib/authStorage'
import { broadcastLogout } from '../lib/authBroadcast'

interface User {
  id: number
  name: string
  email: string
  role: {
    id: number
    name: string
  }
}

export interface Empresa {
  id: number
  nombre_comercial: string
  status: 'pendiente' | 'aprobado' | 'rechazado'
  aprobado: boolean
  ofrece_productos: boolean
  ofrece_servicios: boolean
  modules: {
    products: boolean
    services: boolean
  }
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  empresa: Empresa | null
  token: string | null
  login: (token: string, user: User, empresa?: Empresa | null) => void
  logout: () => void
  refreshEmpresa: () => Promise<Empresa | null>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = authStorage.getToken()
    const storedUser = authStorage.getUser<User>()
    const storedEmpresa = authStorage.getEmpresa<Empresa>()
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
      if (storedEmpresa) setEmpresa(storedEmpresa)
    } else {
      authStorage.clear()
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User, newEmpresa: Empresa | null = null) => {
    authStorage.setToken(newToken)
    authStorage.setUser(newUser)
    if (newEmpresa) {
      authStorage.setEmpresa(newEmpresa)
    } else {
      authStorage.removeEmpresa()
    }
    setToken(newToken)
    setUser(newUser)
    setEmpresa(newEmpresa)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Token ya vencido o servidor caído — limpiamos igual
    }
    authStorage.clear()
    broadcastLogout()
    setToken(null)
    setUser(null)
    setEmpresa(null)
  }

  /**
   * Re-consulta /auth/me y actualiza la empresa cacheada.
   * Útil cuando un admin aprueba la empresa y queremos reflejarlo sin re-login.
   */
  const refreshEmpresa = async (): Promise<Empresa | null> => {
    try {
      const res = await api.get('/auth/me')
      const fresh: Empresa | null = res.data?.data?.empresa ?? null
      if (fresh) {
        authStorage.setEmpresa(fresh)
        setEmpresa(fresh)
      }
      return fresh
    } catch {
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, empresa, token, login, logout, refreshEmpresa, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
