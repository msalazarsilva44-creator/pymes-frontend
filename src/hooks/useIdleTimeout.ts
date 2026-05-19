import { useEffect, useRef } from 'react'
import { authStorage } from '../lib/authStorage'

const IDLE_MINUTES = 30
const IDLE_MS = IDLE_MINUTES * 60 * 1000
const CHECK_INTERVAL_MS = 60 * 1000 // chequeo cada minuto

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart']

export function useIdleTimeout(onTimeout: () => void) {
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  useEffect(() => {
    const handleActivity = () => authStorage.touchActivity()
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))

    const interval = setInterval(() => {
      const last = authStorage.getLastActivity()
      if (last && Date.now() - last > IDLE_MS) {
        onTimeoutRef.current()
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, handleActivity))
      clearInterval(interval)
    }
  }, [])
}
