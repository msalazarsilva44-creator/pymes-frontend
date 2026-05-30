import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

export type SubscriptionAlertVariant = 'warning' | 'error' | 'info'

export interface SubscriptionAlert {
  message: string
  variant?: SubscriptionAlertVariant
}

interface SubscriptionAlertContextType {
  showAlert: (alert: SubscriptionAlert) => void
  clearAlert: () => void
}

const SubscriptionAlertContext = createContext<SubscriptionAlertContextType | undefined>(undefined)

const VARIANT_STYLES: Record<SubscriptionAlertVariant, string> = {
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
  error: 'border-rose-300 bg-rose-50 text-rose-900',
  info: 'border-brand-cyan/40 bg-brand-cyanlt text-brand-navy'
}

const AUTO_DISMISS_MS = 6000

export function SubscriptionAlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<SubscriptionAlert | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const clearAlert = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setAlert(null)
  }, [])

  const showAlert = useCallback((next: SubscriptionAlert) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setAlert({ variant: 'warning', ...next })
    timerRef.current = setTimeout(() => setAlert(null), AUTO_DISMISS_MS)
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const variant = alert?.variant ?? 'warning'
  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: -24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -24 },
        transition: { duration: 0.22, ease: 'easeOut' as const }
      }

  return (
    <SubscriptionAlertContext.Provider value={{ showAlert, clearAlert }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4">
        <AnimatePresence>
          {alert && (
            <motion.div
              key={alert.message}
              {...motionProps}
              role="alert"
              aria-live="assertive"
              className={`pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${VARIANT_STYLES[variant]}`}
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-sm font-medium">{alert.message}</p>
              <button
                type="button"
                onClick={clearAlert}
                aria-label="Cerrar alerta"
                className="rounded-md p-0.5 opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SubscriptionAlertContext.Provider>
  )
}

export function useSubscriptionAlert() {
  const ctx = useContext(SubscriptionAlertContext)
  if (!ctx) {
    throw new Error('useSubscriptionAlert debe usarse dentro de SubscriptionAlertProvider')
  }
  return ctx
}
