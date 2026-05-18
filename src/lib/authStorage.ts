/**
 * Capa de abstracción para el almacenamiento de credenciales.
 * Centraliza el storage para que cambiar de mecanismo en el futuro
 * (ej. HttpOnly cookies) sea una sola modificación.
 *
 * Decisión: sessionStorage en vez de localStorage porque queremos
 * que cerrar la pestaña termine la sesión.
 */

const TOKEN_KEY = 'mercarof_token'
const USER_KEY = 'mercarof_user'
const EMPRESA_KEY = 'mercarof_empresa'
const LAST_ACTIVITY_KEY = 'mercarof_last_activity'

export const authStorage = {
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token)
    this.touchActivity()
  },

  getUser<T = unknown>(): T | null {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },

  setUser<T>(user: T): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getEmpresa<T = unknown>(): T | null {
    const raw = sessionStorage.getItem(EMPRESA_KEY)
    return raw ? JSON.parse(raw) : null
  },

  setEmpresa<T>(empresa: T): void {
    sessionStorage.setItem(EMPRESA_KEY, JSON.stringify(empresa))
  },

  removeEmpresa(): void {
    sessionStorage.removeItem(EMPRESA_KEY)
  },

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(EMPRESA_KEY)
    sessionStorage.removeItem(LAST_ACTIVITY_KEY)
  },

  /** Marca el momento de última actividad (para idle timeout). */
  touchActivity(): void {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
  },

  getLastActivity(): number {
    const v = sessionStorage.getItem(LAST_ACTIVITY_KEY)
    return v ? parseInt(v, 10) : 0
  },
}
