import { Link } from 'react-router-dom'
import { TrendingUp, CheckCircle } from 'lucide-react'
import { RegisterForm } from '../components/Auth/RegisterForm'

export default function Register() {
  const bullets = [
    'Publica tus servicios y productos',
    'Conecta con clientes locales',
    'Gestiona tu negocio desde un solo lugar'
  ]

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <aside className="hidden flex-col justify-between bg-gradient-to-br from-brand-navy via-brand-navy2 to-brand-deep px-12 py-12 text-white lg:flex">
          <div className="space-y-10">
            <Link to="/" className="inline-flex items-center gap-3 text-white/90 transition hover:text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cyan text-brand-deep shadow-lg">
                <TrendingUp className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="font-heading text-2xl font-semibold tracking-[0.25em]">MERCAROF</span>
            </Link>
            <div className="space-y-6">
              <h1 className="font-heading text-4xl font-semibold leading-tight">Únete al marketplace local y haz crecer tu negocio</h1>
              <p className="max-w-md text-base text-white/70">
                Regístrate para descubrir empresas cercanas, publicar tus servicios y conectar con una comunidad que apoya el talento local.
              </p>
            </div>
            <ul className="space-y-4 text-sm">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-white/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-white/50">
            <p>
              Al continuar, aceptas nuestros{' '}
              <Link to="/terminos" className="text-brand-cyan hover:text-brand-cyan/80">
                Términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link to="/privacidad" className="text-brand-cyan hover:text-brand-cyan/80">
                Política de privacidad
              </Link>.
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(14,58,95,0.08)] sm:p-8">
            <RegisterForm />
          </div>
        </section>
      </div>
    </div>
  )
}
