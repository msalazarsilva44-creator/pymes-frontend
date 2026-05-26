import { FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Search } from 'lucide-react'

interface SearchHeroProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  tab: 'servicios' | 'productos'
}

export default function SearchHero({ value, onChange, onSubmit, loading, tab }: SearchHeroProps) {
  const prefersReducedMotion = useReducedMotion()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  const placeholder = tab === 'servicios'
    ? 'Busca servicios de confianza'
    : 'Busca productos destacados'

  return (
    <motion.section
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-brand-navy2 px-6 py-12 text-center text-white shadow-[0_24px_60px_rgba(14,58,95,0.35)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" aria-hidden="true" />
      <div className="relative z-[1] flex flex-col items-center gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            ¿Qué servicio necesitas hoy?
          </h1>
          <p className="text-base font-medium text-white/80 sm:text-lg">
            Conecta con empresas y profesionales locales
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <label htmlFor="marketplace-search" className="sr-only">
            Buscar en el marketplace
          </label>
          <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-[0_18px_46px_rgba(10,46,74,0.25)]">
            <Search className="h-6 w-6 text-brand-navy" aria-hidden="true" />
            <input
              id="marketplace-search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-xl bg-transparent px-1 py-3 text-base font-medium text-brand-deep placeholder:text-brand-deep/60 focus:outline-none"
              aria-label={placeholder}
            />
            <button
              type="submit"
              className="rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy2 disabled:cursor-not-allowed disabled:opacity-80"
              disabled={loading}
            >
              {loading ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
        </form>
      </div>
    </motion.section>
  )
}
