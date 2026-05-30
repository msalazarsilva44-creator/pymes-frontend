import type { EstadoAcceso } from '../context/AuthContext'

/**
 * DIAGNÓSTICO (Paso 0) — CASO A.
 * El estado de suscripción YA viene dentro del objeto de empresa del contexto
 * de auth: `useAuth().empresa.suscripcion.estado_acceso`, poblado por el login
 * y por el endpoint existente `/auth/me` (vía `refreshEmpresa()`).
 * Por tanto el guard lo lee directo del contexto; NO se crea ningún fetch ni
 * endpoint nuevo.
 *
 * Valores reales del backend (union `EstadoAcceso`):
 *   'activa' | 'por_vencer' | 'vencida' | 'pendiente_pago' | 'en_revision' | 'sin_plan'
 */
export type SubscriptionGate =
  | 'active'
  | 'pending_payment'
  | 'under_review'
  | 'rejected'
  | 'expired'
  | 'unknown'

/**
 * Normaliza el `estado_acceso` real del backend al estado canónico del guard.
 * Acepta `string` para poder manejar de forma defensiva valores de rechazo
 * ('rechazada'/'rechazado') que el enum actual no expone.
 */
export function normalizeEstadoAcceso(estado?: EstadoAcceso | string | null): SubscriptionGate {
  switch (estado) {
    case 'activa':
    case 'por_vencer':
      return 'active'
    case 'en_revision':
      return 'under_review'
    case 'vencida':
      return 'expired'
    case 'pendiente_pago':
    case 'sin_plan':
      return 'pending_payment'
    case 'rechazada':
    case 'rechazado':
      return 'rejected'
    default:
      return 'unknown'
  }
}

/** Rutas accesibles para usuarios autenticados pero SIN suscripción activa. */
export const SOLICITAR_PLAN_PATH = '/dashboard/empresa/solicitar-plan'
export const PAGO_EN_REVISION_PATH = '/dashboard/empresa/pago-en-revision'
