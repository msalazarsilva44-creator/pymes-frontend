import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Clock, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function PagoEnRevision() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const prefersReducedMotion = useReducedMotion()

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0A2E4A] via-[#0E3A5F] to-[#103C5E] px-6 font-body">
      <motion.div
        {...motionProps}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cyan/15">
          <Clock className="h-9 w-9 text-brand-cyan" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white">Tu pago está en revisión</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
          Nuestro equipo lo validará en 24-48h. Te avisaremos cuando esté listo.
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/empresa', { replace: true })}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-cyan py-3 font-semibold text-[#0A2E4A] shadow-lg shadow-brand-cyan/30 transition hover:shadow-xl hover:shadow-brand-cyan/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Volver al panel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 py-3 font-semibold text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </motion.div>
    </div>
  )
}
