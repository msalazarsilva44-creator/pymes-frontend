import { api } from '../services/api'
import { authStorage } from './authStorage'

/**
 * Logout seguro: revoca el token en el servidor y limpia el storage local.
 * Si el servidor no responde (caído o token ya vencido), limpiamos igual.
 */
export async function logout(redirectTo: string = '/login') {
  try {
    await api.post('/auth/logout')
  } catch {
    // El servidor puede estar caído o el token ya vencido — limpiamos igual
  }
  authStorage.clear()
  window.location.href = redirectTo
}
