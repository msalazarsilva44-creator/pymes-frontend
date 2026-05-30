import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  normalizeEstadoAcceso,
  SOLICITAR_PLAN_PATH,
  PAGO_EN_REVISION_PATH
} from '../../lib/subscription'
import { useSubscriptionAlert } from './SubscriptionAlertProvider'

/**
 * Guard de suscripción activa (CASO A: lee el estado del contexto de auth).
 *
 * - Refresca `/auth/me` al montar y NO decide hasta tener el dato resuelto
 *   (evita el flash de redirección).
 * - active / unknown  -> renderiza children.
 * - pending_payment   -> alerta + redirige a la pantalla de pago.
 * - expired           -> alerta + redirige a la pantalla de pago.
 * - rejected          -> alerta (con motivo si lo da el backend) + pantalla de pago.
 * - under_review      -> redirige a "Pago en revisión" (sin mandar a pagar).
 */
export default function RequireActiveSubscription({ children }: { children: React.ReactNode }) {
  const { empresa, refreshEmpresa } = useAuth()
  const { showAlert } = useSubscriptionAlert()
  // Si ya hay estado en caché (login/me previo), podemos decidir sin loader y
  // refrescar en segundo plano. Solo bloqueamos cuando aún no hay dato alguno.
  const [resolved, setResolved] = useState<boolean>(() => Boolean(empresa?.suscripcion?.estado_acceso))
  const alerted = useRef(false)

  useEffect(() => {
    let active = true
    refreshEmpresa().finally(() => {
      if (active) setResolved(true)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const gate = normalizeEstadoAcceso(empresa?.suscripcion?.estado_acceso)

  useEffect(() => {
    if (!resolved || alerted.current) return

    if (gate === 'pending_payment') {
      showAlert({
        variant: 'warning',
        message: 'Para disfrutar de los servicios que te ofrece MERCAROF, paga tu suscripción.'
      })
      alerted.current = true
    } else if (gate === 'expired') {
      showAlert({ variant: 'warning', message: 'Tu suscripción venció. Renueva para continuar.' })
      alerted.current = true
    } else if (gate === 'rejected') {
      const motivo =
        (empresa?.suscripcion as { motivo_rechazo?: string } | undefined)?.motivo_rechazo ??
        (empresa as { motivo_rechazo?: string } | null)?.motivo_rechazo
      showAlert({
        variant: 'error',
        message: motivo
          ? `Tu pago fue rechazado: ${motivo}. Por favor reenvíalo.`
          : 'Tu pago fue rechazado. Por favor reenvíalo.'
      })
      alerted.current = true
    }
  }, [resolved, gate, empresa, showAlert])

  if (!resolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FA]" role="status" aria-live="polite">
        <Loader2 className="h-10 w-10 animate-spin text-brand-cyan" aria-hidden="true" />
        <span className="sr-only">Verificando tu suscripción…</span>
      </div>
    )
  }

  switch (gate) {
    case 'under_review':
      return <Navigate to={PAGO_EN_REVISION_PATH} replace />
    case 'pending_payment':
    case 'expired':
    case 'rejected':
      return <Navigate to={SOLICITAR_PLAN_PATH} replace />
    case 'active':
    case 'unknown':
    default:
      return <>{children}</>
  }
}
