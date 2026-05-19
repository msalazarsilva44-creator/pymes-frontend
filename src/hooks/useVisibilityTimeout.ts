import { useEffect } from 'react'
import { authStorage } from '../lib/authStorage'

const HIDDEN_KEY = 'mercarof_hidden_at'
const MAX_HIDDEN_MS = 30 * 60 * 1000 // 30 min oculto = logout

/**
 * Si la pestaña queda oculta (minimizada, otra pestaña activa) por más de 30min,
 * al volver se fuerza el logout. Cubre el caso "me fui del equipo sin cerrar".
 */
export function useVisibilityTimeout(onTimeout: () => void) {
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        sessionStorage.setItem(HIDDEN_KEY, String(Date.now()))
      } else {
        const hiddenAt = parseInt(sessionStorage.getItem(HIDDEN_KEY) || '0', 10)
        if (hiddenAt && Date.now() - hiddenAt > MAX_HIDDEN_MS) {
          authStorage.clear()
          onTimeout()
        }
        sessionStorage.removeItem(HIDDEN_KEY)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [onTimeout])
}
