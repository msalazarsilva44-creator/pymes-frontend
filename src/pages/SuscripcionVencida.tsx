import { useAuth } from '../context/AuthContext'

export default function SuscripcionVencida() {
  const { empresa, logout } = useAuth()
  const planNombre = empresa?.suscripcion?.plan_nombre ?? 'tu plan'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center">
          <svg className="h-9 w-9 text-rose-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Tu suscripción ha vencido</h1>
        <p className="text-white/70 mb-6">
          Para seguir usando tu panel de MERCAROF, renueva tu plan <span className="font-semibold text-white">{planNombre}</span>.
        </p>
        <div className="space-y-3">
          <a
            href="/pago-empresa?renovar=1"
            className="block w-full py-3 rounded-xl bg-mercarof-cyan text-slate-900 font-semibold shadow-lg shadow-mercarof-cyan/30 hover:shadow-xl hover:shadow-mercarof-cyan/40 transition-all"
          >
            Renovar suscripción
          </a>
          <button
            onClick={logout}
            className="block w-full py-3 rounded-xl border border-white/30 text-white/80 font-semibold hover:bg-white/10 transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
